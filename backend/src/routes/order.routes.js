const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour les commandes
router.get('/', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'GESTIONNAIRE_STOCK'), orderController.getAllOrders);
router.get('/:id/receipt.pdf', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'GESTIONNAIRE_STOCK'), orderController.getOrderReceiptPdf);
router.get('/:id', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'GESTIONNAIRE_STOCK'), orderController.getOrderById);
router.post('/', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE'), orderController.createOrder);
router.put('/:id/confirm', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE'), orderController.confirmOrder);
router.put('/:id/deliver', authorize('ADMIN', 'GESTIONNAIRE_TRUCKS'), orderController.markAsDelivered);
router.put('/:id', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE'), orderController.updateOrder);
router.delete('/:id', authorize('ADMIN'), orderController.deleteOrder);

module.exports = router;

