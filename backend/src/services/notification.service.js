const prisma = require('../utils/prisma.util');

/**
 * Service de gestion des notifications
 * Envoie des notifications à l'administrateur et aux utilisateurs concernés
 * 
 * Note: Le service SMS/Twilio a été retiré car il nécessite un abonnement payant
 */

/**
 * Crée une notification et l'envoie à l'administrateur
 */
const createNotification = async (userId, type, title, message, orderId = null) => {
  try {
    // Créer la notification pour l'utilisateur
    const notification = await prisma.notification.create({
      data: {
        userId,
        orderId,
        type,
        title,
        message
      }
    });

    // Envoyer aussi à l'administrateur si ce n'est pas déjà lui
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user && user.role !== 'ADMIN') {
      const admin = await prisma.user.findFirst({
        where: {
          role: 'ADMIN',
          isActive: true
        }
      });

      if (admin) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            orderId,
            type,
            title: `[${user.firstName} ${user.lastName}] ${title}`,
            message
          }
        });
      }
    }

    return notification;
  } catch (error) {
    console.error('Erreur lors de la création de notification:', error);
    // Ne pas faire échouer l'opération principale si la notification échoue
    return null;
  }
};

/**
 * Notifications spécifiques par type
 */
const notifications = {
  orderCreated: async (orderId, createdBy, orderNumber, clientName, amount) => {
    return await createNotification(
      createdBy,
      'ORDER_CREATED',
      'Nouvelle commande créée',
      `Une nouvelle commande #${orderNumber} a été créée pour ${clientName}`,
      orderId
    );
  },

  orderConfirmed: async (orderId, userId, orderNumber) => {
    return await createNotification(
      userId,
      'ORDER_CONFIRMED',
      'Commande confirmée',
      `La commande #${orderNumber} a été confirmée`,
      orderId
    );
  },

  quoteCreated: async (quoteId, userId, quoteNumber, clientName) => {
    return await createNotification(
      userId,
      'QUOTE_CREATED',
      'Devis créé',
      `Un nouveau devis #${quoteNumber} a été créé pour ${clientName}`,
      null
    );
  },

  invoiceCreated: async (invoiceId, orderId, userId, invoiceNumber, clientName, amount) => {
    return await createNotification(
      userId,
      'INVOICE_CREATED',
      'Facture créée',
      `Une nouvelle facture #${invoiceNumber} a été générée pour ${clientName}`,
      orderId
    );
  },

  stockRequestCreated: async (requestId, orderId, userId, requestNumber, orderNumber) => {
    return await createNotification(
      userId,
      'STOCK_REQUEST_CREATED',
      'Bon de demande créé',
      `Un bon de demande #${requestNumber} a été envoyé au magasin pour la commande #${orderNumber}`,
      orderId
    );
  },

  deliveryNoteCreated: async (noteId, orderId, userId, noteNumber, orderNumber) => {
    return await createNotification(
      userId,
      'DELIVERY_NOTE_CREATED',
      'Bon de livraison créé',
      `Un bon de livraison #${noteNumber} a été créé pour la commande #${orderNumber}`,
      orderId
    );
  },

  stockReceived: async (receiptId, userId, receiptNumber, supplierName) => {
    return await createNotification(
      userId,
      'STOCK_RECEIVED',
      'Stock reçu',
      `De nouveaux stocks ont été reçus (Réception #${receiptNumber})`,
      null
    );
  },

  stockLow: async (productId, productName, userId, currentStock, minStock) => {
    return await createNotification(
      userId,
      'STOCK_LOW',
      'Stock faible',
      `Le stock de ${productName} est faible (${currentStock} / minimum: ${minStock})`,
      null
    );
  },

  accountAlert: async (accountId, accountType, balance, userId, threshold) => {
    return await createNotification(
      userId,
      'ACCOUNT_ALERT',
      'Alerte compte',
      `Le compte ${accountType} a atteint le seuil d'alerte. Solde: ${balance} MRU`,
      null
    );
  },

  transactionCreated: async (transactionId, accountId, amount, userId, type, accountType) => {
    return await createNotification(
      userId,
      'TRANSACTION_CREATED',
      'Transaction créée',
      `Une nouvelle transaction ${type} de ${amount} MRU a été enregistrée`,
      null
    );
  }
};

module.exports = {
  createNotification,
  ...notifications
};
