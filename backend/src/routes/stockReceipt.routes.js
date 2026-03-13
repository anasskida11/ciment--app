const express = require('express');
const router = express.Router();
const stockReceiptController = require('../controllers/stockReceipt.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Routes pour les réceptions de stock
router.get('/', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), stockReceiptController.getAllStockReceipts);
router.post('/', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), stockReceiptController.createStockReceipt);
router.put('/:id/confirm', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), stockReceiptController.confirmStockReceipt);

module.exports = router;

