const prisma = require('../utils/prisma.util');

/**
 * Récupère un compte par ID (client ou fournisseur)
 * GET /api/accounts/:id
 */
const getAllAccounts = async (req, res, next) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        client: true,
        supplier: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: { accounts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un compte par ID (client ou fournisseur)
 * GET /api/accounts/:id
 */
const getAccountById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        client: true,
        supplier: true,
        transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Compte non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: { account }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère le compte d'un client
 * GET /api/accounts/client/:clientId
 */
const getClientAccount = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    const account = await prisma.account.findUnique({
      where: { clientId },
      include: {
        client: true,
        transactions: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true
              }
            }
          }
        }
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Compte client non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: { account }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère le compte d'un fournisseur
 * GET /api/accounts/supplier/:supplierId
 */
const getSupplierAccount = async (req, res, next) => {
  try {
    const { supplierId } = req.params;

    const account = await prisma.account.findUnique({
      where: { supplierId },
      include: {
        supplier: true,
        transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Compte fournisseur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: { account }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée un compte pour un client ou un fournisseur
 * POST /api/accounts
 */
const createAccount = async (req, res, next) => {
  try {
    const { accountType, clientId, supplierId, creditLimit, alertThreshold } = req.body;

    if (!accountType || !['CLIENT', 'SUPPLIER'].includes(accountType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الحساب غير صالح'
      });
    }

    if (accountType === 'CLIENT') {
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'معرف العميل مطلوب'
        });
      }

      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client non trouvé'
        });
      }

      const existing = await prisma.account.findUnique({ where: { clientId } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Compte client existe déjà'
        });
      }
    }

    if (accountType === 'SUPPLIER') {
      if (!supplierId) {
        return res.status(400).json({
          success: false,
          message: 'معرف المورد مطلوب'
        });
      }

      const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Fournisseur non trouvé'
        });
      }

      const existing = await prisma.account.findUnique({ where: { supplierId } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Compte fournisseur existe déjà'
        });
      }
    }

    const account = await prisma.account.create({
      data: {
        accountType,
        clientId: accountType === 'CLIENT' ? clientId : null,
        supplierId: accountType === 'SUPPLIER' ? supplierId : null,
        creditLimit: creditLimit !== undefined ? parseFloat(creditLimit) : null,
        alertThreshold: alertThreshold !== undefined ? parseFloat(alertThreshold) : null
      },
      include: {
        client: true,
        supplier: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: { account }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour les paramètres d'un compte
 * PUT /api/accounts/:id
 */
const updateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { creditLimit, alertThreshold } = req.body;

    const existingAccount = await prisma.account.findUnique({
      where: { id }
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'Compte non trouvé'
      });
    }

    const updateData = {};
    if (creditLimit !== undefined) updateData.creditLimit = parseFloat(creditLimit);
    if (alertThreshold !== undefined) updateData.alertThreshold = parseFloat(alertThreshold);

    const account = await prisma.account.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        supplier: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Compte mis à jour avec succès',
      data: { account }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un compte
 * DELETE /api/accounts/:id
 */
const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingAccount = await prisma.account.findUnique({
      where: { id },
      include: { transactions: true }
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'Compte non trouvé'
      });
    }

    // Delete transactions, then account, then the client/supplier
    const deleteOps = [
      prisma.transaction.deleteMany({ where: { accountId: id } }),
      prisma.account.delete({ where: { id } }),
    ];
    if (existingAccount.clientId) {
      deleteOps.push(prisma.client.delete({ where: { id: existingAccount.clientId } }));
    }
    if (existingAccount.supplierId) {
      deleteOps.push(prisma.supplier.delete({ where: { id: existingAccount.supplierId } }));
    }
    await prisma.$transaction(deleteOps);

    res.status(200).json({
      success: true,
      message: 'Compte et entité associée supprimés avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAccounts,
  getAccountById,
  getClientAccount,
  getSupplierAccount,
  createAccount,
  updateAccount,
  deleteAccount
};

