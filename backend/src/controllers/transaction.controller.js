const prisma = require('../utils/prisma.util');

/**
 * Récupère toutes les transactions (tous comptes)
 * GET /api/transactions
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, type, accountId, search, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (type) where.type = type;
    if (accountId) where.accountId = accountId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { account: { client: { name: { contains: search, mode: 'insensitive' } } } },
        { account: { supplier: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            include: {
              client: { select: { id: true, name: true, phone: true } },
              supplier: { select: { id: true, name: true, phone: true } },
            }
          },
          order: { select: { id: true, orderNumber: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    // Aggregations for summary
    const aggregations = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
      _count: true,
    });

    const summary = { DEBIT: 0, CREDIT: 0, PAYMENT: 0, REFUND: 0, total: 0 };
    for (const agg of aggregations) {
      summary[agg.type] = parseFloat(agg._sum.amount || 0);
      summary.total += agg._count;
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: { transactions, summary },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère toutes les transactions d'un compte
 * GET /api/transactions/account/:accountId
 */
const getAccountTransactions = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { accountId },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({
        where: { accountId }
      })
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée une nouvelle transaction
 * POST /api/transactions
 */
const createTransaction = async (req, res, next) => {
  try {
    const { accountId, type, amount, description, documentUrl, reference, orderId } = req.body;

    if (!accountId || !type || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'accountId, type et amount sont requis'
      });
    }

    // Vérification du compte
    const account = await prisma.account.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Compte non trouvé'
      });
    }

    // Calcul du nouveau solde
    let newBalance = parseFloat(account.balance);
    const transactionAmount = parseFloat(amount);

    if (type === 'DEBIT' || type === 'PAYMENT') {
      newBalance -= transactionAmount;
    } else if (type === 'CREDIT' || type === 'REFUND') {
      newBalance += transactionAmount;
    }

    // Vérification de la limite de crédit (pour les clients)
    if (account.accountType === 'CLIENT' && account.creditLimit && newBalance < -parseFloat(account.creditLimit)) {
      return res.status(400).json({
        success: false,
        message: 'Limite de crédit dépassée'
      });
    }

    // Création de la transaction et mise à jour du solde
    const transaction = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          accountId,
          type,
          amount: transactionAmount,
          description,
          documentUrl,
          reference,
          orderId,
          createdById: req.user.id
        }
      });

      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: newBalance
        }
      });

      return newTransaction;
    });

    // Récupération de la transaction complète
    const fullTransaction = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        account: {
          include: {
            client: true,
            supplier: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Transaction créée avec succès',
      data: { transaction: fullTransaction }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère une transaction par ID
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        account: {
          include: {
            client: true,
            supplier: true
          }
        },
        order: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTransactions,
  getAccountTransactions,
  createTransaction,
  getTransactionById
};

