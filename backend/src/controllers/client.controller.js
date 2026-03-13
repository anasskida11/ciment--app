const prisma = require('../utils/prisma.util');

/**
 * Récupère tous les clients
 * GET /api/clients
 */
const getAllClients = async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        chargeClientele: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: clients.length,
      data: { clients }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un client par ID
 * GET /api/clients/:id
 */
const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        chargeClientele: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true
          }
        }
      }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: { client }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée un nouveau client
 * POST /api/clients
 */
const createClient = async (req, res, next) => {
  try {
    const { name, email, phone, idNumber, chargeClienteleId } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du client est requis'
      });
    }

    const clientData = {
      name,
      email: email || null,
      phone: phone || null,
      idNumber: idNumber || null,
      ...(chargeClienteleId && { chargeClienteleId }),
      ...(req.user?.id && !chargeClienteleId && { chargeClienteleId: req.user.id })
    };
    
    const client = await prisma.client.create({
      data: clientData,
      include: {
        chargeClientele: {
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
      message: 'Client créé avec succès',
      data: { client }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création du client:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    next(error);
  }
};

/**
 * Met à jour un client
 * PUT /api/clients/:id
 */
const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, idNumber, isActive, chargeClienteleId } = req.body;

    // Vérification si le client existe
    const existingClient = await prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    // Mise à jour
    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        idNumber,
        isActive,
        chargeClienteleId
      },
      include: {
        chargeClientele: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Client mis à jour avec succès',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un client
 * DELETE /api/clients/:id
 */
const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Vérification si le client existe
    const existingClient = await prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    // Suppression
    await prisma.client.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};

