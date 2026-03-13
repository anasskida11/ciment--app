const prisma = require('../utils/prisma.util');

/**
 * Génère un numéro de bon de demande unique
 */
const generateRequestNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `BD-${timestamp}-${random}`;
};

/**
 * Récupère tous les bons de demande
 * GET /api/stock-requests
 */
const getAllStockRequests = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const stockRequests = await prisma.stockRequest.findMany({
      where,
      include: {
        order: {
          include: {
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        requestedBy: {
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
                unit: true,
                stock: true
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
      count: stockRequests.length,
      data: { stockRequests }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée un bon de demande depuis une commande
 * POST /api/stock-requests
 */
const createStockRequest = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId est requis'
      });
    }

    // Vérifier que la commande existe et a des items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        stockRequest: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (order.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La commande n\'a pas d\'articles'
      });
    }

    if (order.stockRequest) {
      return res.status(400).json({
        success: false,
        message: 'Un bon de demande existe déjà pour cette commande'
      });
    }

    // Créer le bon de demande avec les items
    const stockRequest = await prisma.stockRequest.create({
      data: {
        requestNumber: generateRequestNumber(),
        orderId,
        requestedById: req.user.id,
        status: 'PENDING',
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        order: {
          include: {
            client: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bon de demande créé avec succès',
      data: { stockRequest }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marque un bon de demande comme reçu
 * PUT /api/stock-requests/:id/receive
 */
const receiveStockRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const stockRequest = await prisma.stockRequest.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!stockRequest) {
      return res.status(404).json({
        success: false,
        message: 'Bon de demande non trouvé'
      });
    }

    if (stockRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Ce bon de demande a déjà été traité'
      });
    }

    // Marquer comme reçu
    const updated = await prisma.stockRequest.update({
      where: { id },
      data: {
        status: 'RECEIVED',
        receivedAt: new Date()
      },
      include: {
        order: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Bon de demande marqué comme reçu',
      data: { stockRequest: updated }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStockRequests,
  createStockRequest,
  receiveStockRequest
};

