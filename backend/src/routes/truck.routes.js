const express = require('express');
const router = express.Router();
const truckController = require('../controllers/truck.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Routes pour les trucks
router.get('/available', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'GESTIONNAIRE_TRUCKS'), truckController.getAvailableTrucks);
router.get('/', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'GESTIONNAIRE_TRUCKS'), truckController.getAllTrucks);
router.get('/:id', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'GESTIONNAIRE_TRUCKS'), truckController.getTruckById);
router.post('/', authorize('ADMIN', 'GESTIONNAIRE_TRUCKS'), truckController.createTruck);
router.put('/:id', authorize('ADMIN', 'GESTIONNAIRE_TRUCKS'), truckController.updateTruck);
router.delete('/:id', authorize('ADMIN', 'GESTIONNAIRE_TRUCKS'), truckController.deleteTruck);
router.post('/:id/maintenance', authorize('ADMIN', 'GESTIONNAIRE_TRUCKS'), truckController.addMaintenance);
router.post('/:id/fuel', authorize('ADMIN', 'GESTIONNAIRE_TRUCKS'), truckController.addFuel);
router.post('/:id/expense', authorize('ADMIN', 'GESTIONNAIRE_TRUCKS'), truckController.addExpense);

module.exports = router;

