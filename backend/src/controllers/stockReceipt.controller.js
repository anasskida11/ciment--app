const prisma = require('../utils/prisma.util');

/**
 * Génère un numéro de réception unique
 */
const generateReceiptNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `REC-${timestamp}-${random}`;
};

/**
 * Récupère toutes les réceptions de stock
 * GET /api/stock-receipts
 */
const getAllStockReceipts = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const stockReceipts = await prisma.stockReceipt.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true
          }
        },
        receivedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: stockReceipts.length,
      data: { stockReceipts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée une nouvelle réception de stock
 * POST /api/stock-receipts
 */
const createStockReceipt = async (req, res, next) => {
  try {
    const { supplierId, items, documentUrl } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'items (tableau non vide) est requis'
      });
    }

    // Vérifier les produits
    for (const item of items) {
      const { productId, quantity, unitPrice } = item;

      if (!productId || !quantity || unitPrice === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Chaque item doit avoir productId, quantity et unitPrice'
        });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produit ${productId} non trouvé`
        });
      }
    }

    // Créer la réception
    const stockReceipt = await prisma.stockReceipt.create({
      data: {
        receiptNumber: generateReceiptNumber(),
        supplierId: supplierId || null,
        status: 'PENDING',
        documentUrl,
        receivedById: req.user.id,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice)
          }))
        }
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Réception de stock créée avec succès',
      data: { stockReceipt }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirme une réception et incrémente le stock
 * PUT /api/stock-receipts/:id/confirm
 */
const confirmStockReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const stockReceipt = await prisma.stockReceipt.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!stockReceipt) {
      return res.status(404).json({
        success: false,
        message: 'Réception de stock non trouvée'
      });
    }

    if (stockReceipt.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Cette réception a déjà été traitée'
      });
    }

    // Incrémenter le stock et confirmer la réception
    await prisma.$transaction(async (tx) => {
      // Incrémenter le stock pour chaque produit
      for (const item of stockReceipt.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      // Confirmer la réception
      await tx.stockReceipt.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          receivedAt: new Date()
        }
      });
    });

    // Récupérer la réception mise à jour
    const updated = await prisma.stockReceipt.findUnique({
      where: { id },
      include: {
        supplier: true,
        receivedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Réception confirmée et stock incrémenté avec succès',
      data: { stockReceipt: updated }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStockReceipts,
  createStockReceipt,
  confirmStockReceipt
};

