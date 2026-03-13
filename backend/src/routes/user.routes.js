const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour les utilisateurs
router.get('/', authorize('ADMIN'), userController.getAllUsers);
router.get('/:id', authorize('ADMIN'), userController.getUserById);
router.post('/', authorize('ADMIN'), userController.createUser);
router.put('/:id', authorize('ADMIN'), userController.updateUser);
router.put('/:id/reset-password', authorize('ADMIN'), userController.resetUserPassword);
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);

module.exports = router;

