const prisma = require('../utils/prisma.util');

/**
 * Récupère tous les fournisseurs
 * GET /api/suppliers
 */
const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        account: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: { suppliers }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un fournisseur par ID
 * GET /api/suppliers/:id
 */
const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        account: {
          include: {
            transactions: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
            }
          }
        },
        stockReceipts: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée un nouveau fournisseur avec son compte
 * POST /api/suppliers
 */
const createSupplier = async (req, res, next) => {
  try {
    const { name, email, phone, idNumber, creditLimit, alertThreshold } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du fournisseur est requis'
      });
    }

    // Création du fournisseur avec son compte
    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        idNumber,
        account: {
          create: {
            accountType: 'SUPPLIER',
            balance: 0,
            creditLimit: creditLimit ? parseFloat(creditLimit) : null,
            alertThreshold: alertThreshold ? parseFloat(alertThreshold) : null
          }
        }
      },
      include: {
        account: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Fournisseur créé avec succès',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour un fournisseur
 * PUT /api/suppliers/:id
 */
const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, idNumber, isActive } = req.body;

    const existingSupplier = await prisma.supplier.findUnique({
      where: { id }
    });

    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        idNumber,
        isActive
      },
      include: {
        account: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Fournisseur mis à jour avec succès',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un fournisseur
 * DELETE /api/suppliers/:id
 */
const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingSupplier = await prisma.supplier.findUnique({
      where: { id }
    });

    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    await prisma.supplier.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Fournisseur supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};

