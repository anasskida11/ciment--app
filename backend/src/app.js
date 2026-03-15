const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const clientRoutes = require('./routes/client.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const supplierRoutes = require('./routes/supplier.routes');
const accountRoutes = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');
const truckRoutes = require('./routes/truck.routes');
const truckAssignmentRoutes = require('./routes/truckAssignment.routes');
const stockRequestRoutes = require('./routes/stockRequest.routes');
const deliveryNoteRoutes = require('./routes/deliveryNote.routes');
const stockReceiptRoutes = require('./routes/stockReceipt.routes');
const pdfRoutes = require('./routes/pdf.routes');
const testRoutes = require('./routes/test.routes');
const notificationRoutes = require('./routes/notification.routes');
const activityNotificationMiddleware = require('./middleware/activityNotification.middleware');

// Import error handler
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

// Trust Railway/Vercel proxy
app.set('trust proxy', 1);

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : ['http://localhost:3001'])],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

// Configuration CORS - Permettre toutes les origines en développement
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://ciment-app.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [])
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Automatic activity notifications for successful write operations.
app.use(activityNotificationMiddleware);

// Routes de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/truck-assignments', truckAssignmentRoutes);
app.use('/api/stock-requests', stockRequestRoutes);
app.use('/api/delivery-notes', deliveryNoteRoutes);
app.use('/api/stock-receipts', stockReceiptRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/test', testRoutes);

// Route 404 - Capture toutes les routes non matchées
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler (doit être le dernier middleware)
app.use(errorHandler);

module.exports = app;

