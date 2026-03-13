const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * Routes pour télécharger les PDFs générés
 */

// Middleware pour toutes les routes (authentification requise)
router.use(authenticate);

/**
 * Télécharger une facture PDF
 * GET /api/pdf/invoice/:filename
 */
router.get('/invoice/:filename', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'COMPTABLE'), (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../assets/pdfs', filename);

  if (fs.existsSync(filepath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(filepath));
  } else {
    res.status(404).json({
      success: false,
      message: 'Fichier PDF non trouvé'
    });
  }
});

/**
 * Télécharger un devis PDF
 * GET /api/pdf/quote/:filename
 */
router.get('/quote/:filename', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE'), (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../assets/pdfs', filename);

  if (fs.existsSync(filepath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(filepath));
  } else {
    res.status(404).json({
      success: false,
      message: 'Fichier PDF non trouvé'
    });
  }
});

/**
 * Télécharger un bon de livraison PDF
 * GET /api/pdf/delivery-note/:filename
 */
router.get('/delivery-note/:filename', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../assets/pdfs', filename);

  if (fs.existsSync(filepath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(filepath));
  } else {
    res.status(404).json({
      success: false,
      message: 'Fichier PDF non trouvé'
    });
  }
});

/**
 * Télécharger un bon de demande PDF
 * GET /api/pdf/stock-request/:filename
 */
router.get('/stock-request/:filename', authorize('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'GESTIONNAIRE_STOCK'), (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../assets/pdfs', filename);

  if (fs.existsSync(filepath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(filepath));
  } else {
    res.status(404).json({
      success: false,
      message: 'Fichier PDF non trouvé'
    });
  }
});

/**
 * Télécharger une réception de stock PDF
 * GET /api/pdf/stock-receipt/:filename
 */
router.get('/stock-receipt/:filename', authorize('ADMIN', 'GESTIONNAIRE_STOCK'), (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../assets/pdfs', filename);

  if (fs.existsSync(filepath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(filepath));
  } else {
    res.status(404).json({
      success: false,
      message: 'Fichier PDF non trouvé'
    });
  }
});

module.exports = router;
