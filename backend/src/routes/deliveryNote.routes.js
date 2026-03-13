const express = require('express');
const router = express.Router();
const deliveryNoteController = require('../controllers/deliveryNote.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Routes pour les bons de livraison
router.get('/', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), deliveryNoteController.getAllDeliveryNotes);
router.post('/', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), deliveryNoteController.createDeliveryNote);
router.put('/:id/confirm', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), deliveryNoteController.confirmDelivery);
router.get('/:id/pdf', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), deliveryNoteController.getDeliveryNotePdf);

module.exports = router;

