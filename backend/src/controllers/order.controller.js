const prisma = require('../utils/prisma.util');
const PDFDocument = require('pdfkit');

/**
 * Génère un numéro de commande unique (CMD-YYMMDD-XXXX)
 * Uses retry loop to handle race conditions with unique constraint
 */
const generateOrderNumber = async () => {
  const maxRetries = 5;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yy}${mm}${dd}`;
    const prefix = `CMD-${dateStr}-`;
    const lastOrder = await prisma.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
    });
    let seq = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.orderNumber.split('-').pop(), 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }
    const orderNumber = `${prefix}${String(seq).padStart(4, '0')}`;
    // Check uniqueness before returning
    const exists = await prisma.order.findUnique({ where: { orderNumber } });
    if (!exists) return orderNumber;
  }
  // Fallback: append random suffix
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = require('crypto').randomBytes(3).toString('hex');
  return `CMD-${yy}${mm}${dd}-${rand}`;
};

/**
 * Récupère toutes les commandes
 * GET /api/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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
        },
        truckAssignments: {
          include: {
            truck: {
              select: {
                id: true,
                matricule: true
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
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère une commande par ID
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Génère un PDF de facture pour une commande
 * GET /api/orders/:id/receipt.pdf
 */
const getOrderReceiptPdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${order.orderNumber || order.id}.pdf"`);

    doc.pipe(res);

    const formatMoney = (n) => {
      const num = typeof n === 'string' ? parseFloat(n) : (n || 0);
      return `${num.toFixed(2)}`;
    };

    const company = {
      name: process.env.COMPANY_NAME || 'Ciment App',
      address: process.env.COMPANY_ADDRESS || '',
      phone: process.env.COMPANY_PHONE || '',
      email: process.env.COMPANY_EMAIL || ''
    };

    doc.fontSize(18).text('Invoice', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(10).text(company.name, { align: 'center' });
    if (company.address) doc.text(company.address, { align: 'center' });
    if (company.phone || company.email) {
      doc.text([company.phone, company.email].filter(Boolean).join(' • '), { align: 'center' });
    }
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Order #: ${order.orderNumber || order.id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString('fr-FR')}`);
    doc.moveDown(0.5);

    if (order.client) {
      doc.text(`Client: ${order.client.name || ''}`);
      if (order.client.phone) doc.text(`Phone: ${order.client.phone}`);
      if (order.client.email) doc.text(`Email: ${order.client.email}`);
    }

    doc.moveDown(1);

    // Table header
    const tableTop = doc.y;
    doc.fontSize(11).text('Product', 50, tableTop, { width: 220 });
    doc.text('Qty', 280, tableTop, { width: 60, align: 'right' });
    doc.text('Unit', 350, tableTop, { width: 80, align: 'right' });
    doc.text('Total', 440, tableTop, { width: 100, align: 'right' });
    doc.moveDown(0.5);

    let y = doc.y;
    order.items.forEach((item) => {
      const name = item.product?.name || 'Unknown';
      doc.text(name, 50, y, { width: 220 });
      doc.text(String(item.quantity), 280, y, { width: 60, align: 'right' });
      doc.text(formatMoney(item.unitPrice), 350, y, { width: 80, align: 'right' });
      doc.text(formatMoney(item.subtotal), 440, y, { width: 100, align: 'right' });
      y = doc.y + 6;
    });

    doc.moveDown(1);
    doc.fontSize(12).text(`Total: ${formatMoney(order.totalAmount)}`, { align: 'right' });
    if (order.notes) {
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Notes: ${order.notes}`);
    }
    doc.moveDown(1);
    doc.fontSize(10).text('Generated by Ciment App', { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

/**
 * Crée une nouvelle commande
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const { clientId, items, notes } = req.body;

    // Validation
    if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'clientId et items (tableau non vide) sont requis'
      });
    }

    // Vérification du client
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    // Vérification des produits et calcul du total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Chaque item doit avoir productId et quantity'
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

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Le produit ${product.name} est inactif`
        });
      }

      const quantityDecimal = parseFloat(quantity);
      const unitPriceDecimal = parseFloat(product.price);
      const subtotal = quantityDecimal * unitPriceDecimal;

      orderItems.push({
        productId,
        quantity: quantityDecimal,
        unitPrice: unitPriceDecimal,
        subtotal: subtotal
      });

      totalAmount += subtotal;
    }

    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    // Création de la commande avec ses items
    const orderNumber = await generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        clientId,
        createdById: req.user.id,
        totalAmount: parseFloat(totalAmount.toFixed(2)), // S'assurer que c'est un nombre avec 2 décimales
        notes: notes || null,
        status: 'PENDING',
        items: {
          create: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal
          }))
        }
      },
      include: {
        client: true,
        createdBy: {
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

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: { order }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création de commande:', error);
    console.error('❌ Erreur code:', error.code);
    console.error('❌ Erreur message:', error.message);
    console.error('❌ Erreur meta:', error.meta);
    next(error);
  }
};

/**
 * Confirme une commande et décrémente le stock
 * PUT /api/orders/:id/confirm
 */
const confirmOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Récupération de la commande
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Seules les commandes en attente peuvent être confirmées'
      });
    }

    // Vérification du stock disponible
    for (const item of order.items) {
      if (parseFloat(item.product.stock) < parseFloat(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour le produit ${item.product.name}. Stock disponible: ${item.product.stock}, demandé: ${item.quantity}`
        });
      }
    }

    // Décrémentation du stock et confirmation de la commande
    await prisma.$transaction(async (tx) => {
      // Mise à jour du stock pour chaque produit
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Confirmation de la commande
      await tx.order.update({
        where: { id },
        data: {
          status: 'CONFIRMED'
        }
      });
    });

    // Récupération de la commande mise à jour
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        createdBy: {
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
      message: 'Commande confirmée et stock décrémenté avec succès',
      data: { order: updatedOrder }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour une commande
 * PUT /api/orders/:id
 */
const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Vérification si la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Préparation des données de mise à jour
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // Mise à jour
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        createdBy: {
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
      message: 'Commande mise à jour avec succès',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime une commande
 * DELETE /api/orders/:id
 */
const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Vérification si la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Suppression (les items seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.order.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Commande supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marque une commande comme livrée
 * PUT /api/orders/:id/deliver
 */
const markAsDelivered = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        truckAssignments: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (order.status !== 'CONFIRMED' && order.status !== 'READY') {
      return res.status(400).json({
        success: false,
        message: 'Seules les commandes confirmées ou prêtes peuvent être marquées comme livrées'
      });
    }

    // Verify all quantity is assigned
    const totalQty = order.items.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
    const assignedQty = order.truckAssignments.reduce((sum, a) => sum + parseFloat(a.quantity), 0);
    const remaining = totalQty - assignedQty;

    if (remaining > 0) {
      return res.status(400).json({
        success: false,
        message: `Il reste ${remaining} tonnes non assignées. Toute la quantité doit être assignée avant de marquer comme livrée.`
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'DELIVERED' },
      include: {
        client: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: { product: true }
        },
        truckAssignments: {
          include: {
            truck: {
              select: { id: true, matricule: true }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Commande marquée comme livrée avec succès',
      data: { order: updatedOrder }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderReceiptPdf,
  createOrder,
  confirmOrder,
  updateOrder,
  deleteOrder,
  markAsDelivered
};

