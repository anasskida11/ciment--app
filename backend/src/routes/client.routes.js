const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour les clients
router.get('/', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE'), clientController.getAllClients);
router.get('/:id', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE'), clientController.getClientById);
router.post('/', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE'), clientController.createClient);
router.put('/:id', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE'), clientController.updateClient);
router.delete('/:id', authorize('ADMIN'), clientController.deleteClient);

module.exports = router;

