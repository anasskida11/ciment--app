const prisma = require('../utils/prisma.util');

/**
 * Récupérer toutes les notifications de l'admin connecté
 * GET /api/notifications
 */
const getAll = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer une notification comme lue
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود'
      });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.status(200).json({
      success: true,
      message: 'تم تحديث الإشعار'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer toutes les notifications comme lues
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    res.status(200).json({
      success: true,
      message: 'تم تحديث جميع الإشعارات'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  markAsRead,
  markAllAsRead
};
