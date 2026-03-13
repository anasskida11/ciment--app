const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour les produits
router.get('/', authorize('ADMIN', 'GESTIONNAIRE_STOCK', 'GESTIONNAIRE_CLIENTELE'), productController.getAllProducts);
router.get('/:id', authorize('ADMIN', 'GESTIONNAIRE_STOCK', 'GESTIONNAIRE_CLIENTELE'), productController.getProductById);
router.post('/', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), productController.createProduct);
router.put('/:id', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), productController.updateProduct);
router.delete('/:id', authorize('ADMIN'), productController.deleteProduct);

module.exports = router;

