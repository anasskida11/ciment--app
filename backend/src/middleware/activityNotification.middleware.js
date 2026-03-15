const { createNotification } = require('../services/notification.service');

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'accessToken',
  'refreshToken',
]);

const RESOURCE_LABELS = {
  users: 'المستخدمين',
  clients: 'العملاء',
  products: 'المنتجات',
  orders: 'الطلبات',
  suppliers: 'الموردين',
  accounts: 'الحسابات',
  transactions: 'العمليات المالية',
  trucks: 'الشاحنات',
  'truck-assignments': 'تعيينات الشاحنات',
  'stock-requests': 'طلبات المخزون',
  'delivery-notes': 'سندات التسليم',
  'stock-receipts': 'استلامات المخزون',
  pdf: 'الملفات',
};

const METHOD_LABELS = {
  POST: 'إضافة',
  PUT: 'تعديل',
  PATCH: 'تعديل',
  DELETE: 'حذف',
};

const EXPLICIT_NOTIFICATION_RESOURCES = new Set([
  'orders',
  'stock-requests',
  'delivery-notes',
  'stock-receipts',
]);

const shouldTrack = (req, res) => {
  if (!req.user || !req.user.id) return false;
  if (!req.path.startsWith('/api/')) return false;
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return false;

  if (
    req.method === 'PUT' &&
    req.originalUrl.startsWith('/api/products/') &&
    req.body &&
    req.body.stock !== undefined
  ) {
    return false;
  }

  const pathParts = req.originalUrl.split('?')[0].split('/').filter(Boolean);
  const resourceSegment = pathParts[1] || '';
  if (EXPLICIT_NOTIFICATION_RESOURCES.has(resourceSegment)) return false;

  const ignoredPrefixes = ['/api/auth', '/api/notifications', '/api/test'];
  if (ignoredPrefixes.some((prefix) => req.originalUrl.startsWith(prefix))) return false;

  return res.statusCode >= 200 && res.statusCode < 300;
};

const cleanValue = (value) => {
  if (value == null) return value;
  if (Array.isArray(value)) return `array(${value.length})`;
  if (typeof value === 'object') return 'object';
  const asString = String(value);
  return asString.length > 80 ? `${asString.slice(0, 77)}...` : asString;
};

const summarizePayload = (body) => {
  if (!body || typeof body !== 'object') return '';

  const keys = Object.keys(body)
    .filter((key) => !SENSITIVE_KEYS.has(key.toLowerCase()))
    .slice(0, 4);

  if (keys.length === 0) return '';

  const parts = keys.map((key) => `${key}: ${cleanValue(body[key])}`);
  return ` (${parts.join(' | ')})`;
};

const buildNotification = (req) => {
  const pathParts = req.originalUrl.split('?')[0].split('/').filter(Boolean);
  const resourceSegment = pathParts[1] || 'general';
  const resourceLabel = RESOURCE_LABELS[resourceSegment] || resourceSegment;
  const actionLabel = METHOD_LABELS[req.method] || 'تحديث';
  const targetId = req.params?.id || pathParts[2] || '';

  const title = `${actionLabel} في ${resourceLabel}`;
  const idSuffix = targetId ? ` #${targetId}` : '';
  const payloadSuffix = summarizePayload(req.body);
  const message = `تم ${actionLabel} عنصر في ${resourceLabel}${idSuffix}${payloadSuffix}`;

  return { title, message };
};

const activityNotificationMiddleware = (req, res, next) => {
  res.on('finish', () => {
    if (!shouldTrack(req, res)) return;

    const { title, message } = buildNotification(req);

    // Fire and forget: never block the API response.
    setImmediate(async () => {
      try {
        await createNotification(req.user.id, 'GENERAL', title, message, null);
      } catch (error) {
        console.error('Activity notification failed:', error.message);
      }
    });
  });

  next();
};

module.exports = activityNotificationMiddleware;
