const prisma = require('../utils/prisma.util');

const ACTIVE_ASSIGNMENT_STATUSES = ['ASSIGNED', 'CONFIRMED', 'IN_TRANSIT'];

const sumQuantity = (items = []) =>
  items.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);

/**
 * Récupère les assignations d'un ordre
 * GET /api/truck-assignments/order/:orderId
 */
const getAssignmentsByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const assignments = await prisma.truckAssignment.findMany({
      where: { orderId },
      include: {
        truck: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: { assignments }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée une assignation de truck à une commande confirmée
 * POST /api/truck-assignments
 */
const createAssignment = async (req, res, next) => {
  try {
    const { orderId, truckId, quantity, driverName } = req.body;

    if (!orderId || !truckId) {
      return res.status(400).json({
        success: false,
        message: 'orderId و truckId مطلوبان'
      });
    }

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'الكمية يجب أن تكون أكبر من 0'
      });
    }

    const [order, truck] = await Promise.all([
      prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      }),
      prisma.truck.findUnique({ where: { id: truckId } })
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (order.status !== 'CONFIRMED' && order.status !== 'READY') {
      return res.status(400).json({
        success: false,
        message: 'يمكن تعيين السيارات للطلبات المؤكدة أو الجاهزة فقط'
      });
    }

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck non trouvé'
      });
    }

    if (truck.capacity && qty > parseFloat(truck.capacity)) {
      return res.status(400).json({
        success: false,
        message: 'الكمية تتجاوز سعة السيارة'
      });
    }

    const [existingAssignment, activeAssignment] = await Promise.all([
      prisma.truckAssignment.findFirst({
        where: { orderId, truckId }
      }),
      prisma.truckAssignment.findFirst({
        where: {
          truckId,
          status: { in: ACTIVE_ASSIGNMENT_STATUSES },
          orderId: { not: orderId }
        }
      })
    ]);

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'تم تعيين هذه السيارة لهذا الطلب مسبقاً'
      });
    }

    if (activeAssignment) {
      return res.status(409).json({
        success: false,
        message: 'السيارة مرتبطة بطلب آخر نشط'
      });
    }

    const orderTotal = sumQuantity(order.items);
    const assigned = await prisma.truckAssignment.findMany({
      where: { orderId }
    });
    const assignedTotal = sumQuantity(assigned);

    if (assignedTotal + qty > orderTotal) {
      return res.status(400).json({
        success: false,
        message: 'الكمية الموزعة تتجاوز كمية الطلب'
      });
    }

    const assignment = await prisma.truckAssignment.create({
      data: {
        orderId,
        truckId,
        quantity: qty,
        driverName: driverName || null,
        status: 'ASSIGNED'
      },
      include: {
        truck: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        }
      }
    });

    await prisma.truck.update({
      where: { id: truckId },
      data: { isActive: true }
    });

    res.status(201).json({
      success: true,
      message: 'تم تعيين السيارة بنجاح',
      data: { assignment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime une assignation
 * DELETE /api/truck-assignments/:id
 */
const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.truckAssignment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Assignation non trouvée'
      });
    }

    await prisma.truckAssignment.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Assignation supprimée'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marque une assignation comme livrée (libère la voiture)
 * PATCH /api/truck-assignments/:id/complete
 */
const completeAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliveryCost, notes } = req.body || {};

    const existing = await prisma.truckAssignment.findUnique({
      where: { id },
      include: {
        truck: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        }
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Assignation non trouvée'
      });
    }

    const updateData = {
      status: 'DELIVERED',
      completedAt: new Date()
    };

    if (deliveryCost !== undefined && deliveryCost !== null && deliveryCost !== '') {
      const cost = parseFloat(deliveryCost);
      if (Number.isFinite(cost) && cost >= 0) {
        updateData.deliveryCost = cost;
      }
    }

    if (notes !== undefined && notes !== null) {
      updateData.notes = String(notes).trim() || null;
    }

    const updated = await prisma.truckAssignment.update({
      where: { id },
      data: updateData,
      include: {
        truck: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'تم إكمال التوصيل وتحرير السيارة',
      data: { assignment: updated }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignmentsByOrder,
  createAssignment,
  deleteAssignment,
  completeAssignment
};
