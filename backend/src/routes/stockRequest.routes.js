const express = require('express');
const router = express.Router();
const stockRequestController = require('../controllers/stockRequest.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Routes pour les bons de demande
router.get('/', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'GESTIONNAIRE_STOCK'), stockRequestController.getAllStockRequests);
router.post('/', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE'), stockRequestController.createStockRequest);
router.put('/:id/receive', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), stockRequestController.receiveStockRequest);

module.exports = router;

