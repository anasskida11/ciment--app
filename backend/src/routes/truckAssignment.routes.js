const express = require('express');
const router = express.Router();
const truckAssignmentController = require('../controllers/truckAssignment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Routes pour les assignations de trucks
router.get('/order/:orderId', authorize('ADMIN', 'GESTIONNAIRE_TRUCKS', 'GESTIONNAIRE_CLIENTELE'), truckAssignmentController.getAssignmentsByOrder);
router.post('/', authorize('ADMIN', 'GESTIONNAIRE_TRUCKS'), truckAssignmentController.createAssignment);
router.patch('/:id/complete', authorize('ADMIN', 'GESTIONNAIRE_TRUCKS'), truckAssignmentController.completeAssignment);
router.delete('/:id', authorize('ADMIN', 'GESTIONNAIRE_TRUCKS'), truckAssignmentController.deleteAssignment);

module.exports = router;
