const prisma = require('../utils/prisma.util');
const { hashPassword } = require('../utils/bcrypt.util');

/**
 * Récupère tous les utilisateurs
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un utilisateur par ID
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée un nouvel utilisateur
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { email, firstName, lastName, role, isActive } = req.body;

    // Validation
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    // Vérification si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Mot de passe par défaut
    const defaultPassword = require('crypto').randomBytes(6).toString('hex');
    const hashedPassword = await hashPassword(defaultPassword);

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'GESTIONNAIRE_CLIENTELE',
        ...(typeof isActive === 'boolean' ? { isActive } : {})
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: `Utilisateur créé avec succès (mot de passe temporaire: ${defaultPassword})`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Réinitialise le mot de passe d'un utilisateur
 * PUT /api/users/:id/reset-password
 */
const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const resetPassword = require('crypto').randomBytes(6).toString('hex');
    const hashedPassword = await hashPassword(resetPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: `Mot de passe réinitialisé: ${resetPassword}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour un utilisateur
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName, role, isActive } = req.body;

    // Vérification si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Préparation des données de mise à jour
    const updateData = {};
    if (email) updateData.email = email;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Mise à jour
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un utilisateur
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Vérification si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Suppression
    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword
};

