/**
 * Constantes partagées
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  GESTIONNAIRE_CLIENTELE: 'GESTIONNAIRE_CLIENTELE',
  GESTIONNAIRE_STOCK: 'GESTIONNAIRE_STOCK',
  GESTIONNAIRE_TRUCKS: 'GESTIONNAIRE_TRUCKS',
  COMPTABLE: 'COMPTABLE',
} as const;

// Labels des rôles en arabe
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  GESTIONNAIRE_CLIENTELE: 'Gestionnaire de clientèles',
  GESTIONNAIRE_STOCK: 'Gestionnaire de stock',
  GESTIONNAIRE_TRUCKS: 'Gestionnaire de trucks',
  COMPTABLE: 'Comptable',
};

// Labels des rôles en arabe
export const ROLE_LABELS_AR: Record<string, string> = {
  ADMIN: 'المدير',
  GESTIONNAIRE_CLIENTELE: 'مدير العلاقات مع العملاء',
  GESTIONNAIRE_STOCK: 'مدير المخزون',
  GESTIONNAIRE_TRUCKS: 'مدير الأسطول',
  COMPTABLE: 'المحاسب',
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  QUOTE_SENT: 'QUOTE_SENT',
  QUOTE_ACCEPTED: 'QUOTE_ACCEPTED',
  CONFIRMED: 'CONFIRMED',
  STOCK_REQUESTED: 'STOCK_REQUESTED',
  IN_PREPARATION: 'IN_PREPARATION',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  ARCHIVED: 'ARCHIVED',
  CANCELLED: 'CANCELLED',
} as const;

export const ACCOUNT_TYPES = {
  CLIENT: 'CLIENT',
  SUPPLIER: 'SUPPLIER',
} as const;

export const TRANSACTION_TYPES = {
  DEBIT: 'DEBIT',
  CREDIT: 'CREDIT',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
} as const;
