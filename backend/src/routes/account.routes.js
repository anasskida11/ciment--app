const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Routes pour les comptes
router.get('/', authorize('ADMIN', 'COMPTABLE'), accountController.getAllAccounts);
router.post('/', authorize('ADMIN', 'COMPTABLE'), accountController.createAccount);
router.get('/client/:clientId', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'COMPTABLE'), accountController.getClientAccount);
router.get('/supplier/:supplierId', authorize('ADMIN', 'GESTIONNAIRE_STOCK', 'COMPTABLE'), accountController.getSupplierAccount);
router.get('/:id', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'COMPTABLE'), accountController.getAccountById);
router.put('/:id', authorize('ADMIN', 'COMPTABLE'), accountController.updateAccount);
router.delete('/:id', authorize('ADMIN', 'COMPTABLE'), accountController.deleteAccount);

module.exports = router;

