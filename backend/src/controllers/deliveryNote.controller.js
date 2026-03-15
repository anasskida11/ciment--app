const prisma = require('../utils/prisma.util');
const pdfService = require('../services/pdf/pdf.service');
const { createNotification } = require('../services/notification.service');

/**
 * Génère un numéro de bon de livraison unique (BL-YYMMDD-XXXX)
 */
const generateNoteNumber = async () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateStr = `${yy}${mm}${dd}`;
  const prefix = `BL-${dateStr}-`;
  const lastNote = await prisma.deliveryNote.findFirst({
    where: { noteNumber: { startsWith: prefix } },
    orderBy: { createdAt: 'desc' },
  });
  let seq = 1;
  if (lastNote) {
    const lastSeq = parseInt(lastNote.noteNumber.split('-').pop(), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }
  return `${prefix}${String(seq).padStart(4, '0')}`;
};

/**
 * Récupère tous les bons de livraison
 * GET /api/delivery-notes
 */
const getAllDeliveryNotes = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const deliveryNotes = await prisma.deliveryNote.findMany({
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
        createdBy: {
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
      count: deliveryNotes.length,
      data: { deliveryNotes }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée un bon de livraison depuis un bon de demande reçu
 * POST /api/delivery-notes
 */
const createDeliveryNote = async (req, res, next) => {
  try {
    const { orderId, deliveryAddress } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId est requis'
      });
    }

    // Vérifier que la commande existe et a un bon de demande reçu
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        stockRequest: true,
        deliveryNote: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Autoriser la création du bon de livraison pour les commandes confirmées
    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'La commande doit être confirmée pour créer un bon de livraison'
      });
    }

    if (order.deliveryNote) {
      return res.status(400).json({
        success: false,
        message: 'Un bon de livraison existe déjà pour cette commande'
      });
    }

    // Créer le bon de livraison
    const noteNumber = await generateNoteNumber();
    const deliveryNote = await prisma.deliveryNote.create({
      data: {
        noteNumber,
        orderId,
        deliveryAddress: deliveryAddress || null,
        status: 'DRAFT',
        createdById: req.user.id,
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

    await createNotification(
      req.user.id,
      'GENERAL',
      'سند تسليم جديد',
      `تم إنشاء سند التسليم #${deliveryNote.noteNumber} للطلب #${deliveryNote.order?.orderNumber || orderId}`,
      deliveryNote.orderId
    );

    res.status(201).json({
      success: true,
      message: 'Bon de livraison créé avec succès',
      data: { deliveryNote }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirme la livraison et décrémente le stock
 * PUT /api/delivery-notes/:id/confirm
 */
const confirmDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deliveryNote = await prisma.deliveryNote.findUnique({
      where: { id },
      include: {
        order: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!deliveryNote) {
      return res.status(404).json({
        success: false,
        message: 'Bon de livraison non trouvé'
      });
    }

    if (deliveryNote.status === 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Cette livraison a déjà été confirmée'
      });
    }

    // Vérifier le stock disponible
    for (const item of deliveryNote.items) {
      if (parseFloat(item.product.stock) < parseFloat(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour ${item.product.name}. Stock: ${item.product.stock}, Demandé: ${item.quantity}`
        });
      }
    }

    // Décrémenter le stock et confirmer la livraison
    await prisma.$transaction(async (tx) => {
      // Décrémenter le stock
      for (const item of deliveryNote.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Mettre à jour le bon de livraison
      await tx.deliveryNote.update({
        where: { id },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date()
        }
      });

      // Mettre à jour le bon de demande
      if (deliveryNote.order.stockRequest) {
        await tx.stockRequest.update({
          where: { id: deliveryNote.order.stockRequest.id },
          data: {
            status: 'PROCESSED'
          }
        });
      }

      // Mark order as delivered (final state for fleet visibility)
      await tx.order.update({
        where: { id: deliveryNote.orderId },
        data: {
          status: 'DELIVERED'
        }
      });
    });

    // Récupérer le bon de livraison mis à jour
    const updated = await prisma.deliveryNote.findUnique({
      where: { id },
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

    await createNotification(
      req.user.id,
      'GENERAL',
      'تأكيد تسليم',
      `تم تأكيد تسليم سند #${updated.noteNumber}`,
      updated.orderId
    );

    res.status(200).json({
      success: true,
      message: 'Livraison confirmée et stock décrémenté avec succès',
      data: { deliveryNote: updated }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Génère le PDF du bon de livraison
 * GET /api/delivery-notes/:id/pdf
 */
const getDeliveryNotePdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deliveryNote = await prisma.deliveryNote.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            client: true,
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!deliveryNote) {
      return res.status(404).json({
        success: false,
        message: 'Bon de livraison non trouvé'
      });
    }

    const truckAssignment = await prisma.truckAssignment.findFirst({
      where: { orderId: deliveryNote.orderId },
      include: {
        truck: true
      }
    });

    const { filepath, filename } = await pdfService.generateDeliveryNote(
      deliveryNote,
      deliveryNote.order,
      deliveryNote.order.client,
      deliveryNote.order.items,
      truckAssignment
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filepath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDeliveryNotes,
  createDeliveryNote,
  confirmDelivery,
  getDeliveryNotePdf
};

