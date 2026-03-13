const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Routes pour les transactions
router.get('/', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'COMPTABLE'), transactionController.getAllTransactions);
router.get('/account/:accountId', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'COMPTABLE'), transactionController.getAccountTransactions);
router.get('/:id', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'COMPTABLE'), transactionController.getTransactionById);
router.post('/', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'COMPTABLE'), transactionController.createTransaction);

module.exports = router;

