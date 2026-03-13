const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Routes pour les fournisseurs
router.get('/', authorize('ADMIN', 'GESTIONNAIRE_STOCK', 'COMPTABLE'), supplierController.getAllSuppliers);
router.get('/:id', authorize('ADMIN', 'GESTIONNAIRE_STOCK', 'COMPTABLE'), supplierController.getSupplierById);
router.post('/', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), supplierController.createSupplier);
router.put('/:id', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), supplierController.updateSupplier);
router.delete('/:id', authorize('ADMIN'), supplierController.deleteSupplier);

module.exports = router;

