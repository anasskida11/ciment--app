const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');

/**
 * Route de test - Vérifie que l'API fonctionne
 * GET /api/test
 */
router.get('/', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API fonctionne correctement ! 🎉',
    timestamp: new Date().toISOString(),
    data: {
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }
  });
});

/**
 * Route de test avec authentification
 * GET /api/test/auth
 */
router.get('/auth', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentification réussie ! ✅',
    user: req.user
  });
});

module.exports = router;

