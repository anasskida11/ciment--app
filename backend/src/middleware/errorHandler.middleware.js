/**
 * Middleware de gestion des erreurs
 * Capture toutes les erreurs et les formate de manière cohérente
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

  // Erreur Prisma
  if (err.code && err.code.startsWith('P')) {
    console.error('❌ Prisma Error:', err.code, err.meta);
    console.error('❌ Prisma Error Message:', err.message);
    let message = 'Erreur de base de données';
    
    // Messages d'erreur Prisma spécifiques
    if (err.code === 'P2002') {
      message = `Une valeur en double existe déjà: ${err.meta?.target?.join(', ') || 'champ unique'}`;
    } else if (err.code === 'P2003') {
      message = `Référence invalide: ${err.meta?.field_name || 'relation'}`;
    } else if (err.code === 'P2025') {
      message = 'Enregistrement non trouvé';
    } else if (err.code === 'P2011') {
      message = `Contrainte de nullité violée: ${err.meta?.constraint || 'champ requis'}`;
    } else if (err.code === 'P2012') {
      message = `Erreur de validation: ${err.meta?.reason || err.message}`;
    }
    
    return res.status(400).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      code: err.code,
      meta: process.env.NODE_ENV === 'development' ? err.meta : undefined
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Erreur d\'authentification',
      error: err.message
    });
  }

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      error: err.message
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;

