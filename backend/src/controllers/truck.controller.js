const prisma = require('../utils/prisma.util');

/**
 * Récupère tous les trucks
 * GET /api/trucks
 */
const getAllTrucks = async (req, res, next) => {
  try {
    const trucks = await prisma.truck.findMany({
      include: {
        assignments: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                status: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        _count: {
          select: {
            maintenances: true,
            fuels: true,
            expenses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: trucks.length,
      data: { trucks }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un truck par ID avec tous ses détails
 * GET /api/trucks/:id
 */
const getTruckById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const truck = await prisma.truck.findUnique({
      where: { id },
      include: {
        assignments: {
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
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        maintenances: {
          orderBy: {
            date: 'desc'
          }
        },
        fuels: {
          orderBy: {
            date: 'desc'
          },
          take: 20
        },
        expenses: {
          orderBy: {
            date: 'desc'
          },
          take: 20
        }
      }
    });

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck non trouvé'
      });
    }

    // Calcul des coûts totaux
    const totalMaintenance = truck.maintenances.reduce((sum, m) => sum + parseFloat(m.cost), 0);
    const totalFuel = truck.fuels.reduce((sum, f) => sum + parseFloat(f.cost), 0);
    const totalExpenses = truck.expenses.reduce((sum, e) => sum + parseFloat(e.cost), 0);
    const totalCost = totalMaintenance + totalFuel + totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        truck,
        costs: {
          totalMaintenance,
          totalFuel,
          totalExpenses,
          totalCost
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère les trucks disponibles (non assignés à une commande active)
 * GET /api/trucks/available
 */
const getAvailableTrucks = async (req, res, next) => {
  try {
    // Filter at database level: trucks with no active assignments
    const availableTrucks = await prisma.truck.findMany({
      where: {
        isActive: true,
        assignments: {
          none: {
            status: {
              in: ['ASSIGNED', 'CONFIRMED', 'IN_TRANSIT']
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: availableTrucks.length,
      data: { trucks: availableTrucks }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée un nouveau truck
 * POST /api/trucks
 */
const createTruck = async (req, res, next) => {
  try {
    const { matricule, brand, model, year, capacity } = req.body;

    if (!matricule) {
      return res.status(400).json({
        success: false,
        message: 'Le matricule est requis'
      });
    }

    // Vérifier si le matricule existe déjà
    const existingTruck = await prisma.truck.findUnique({
      where: { matricule }
    });

    if (existingTruck) {
      return res.status(400).json({
        success: false,
        message: 'Ce matricule existe déjà'
      });
    }

    const truck = await prisma.truck.create({
      data: {
        matricule,
        brand,
        model,
        year: year ? parseInt(year) : null,
        capacity: capacity ? parseFloat(capacity) : null,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Truck créé avec succès',
      data: { truck }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour un truck
 * PUT /api/trucks/:id
 */
const updateTruck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { matricule, brand, model, year, capacity, isActive } = req.body;

    const existingTruck = await prisma.truck.findUnique({
      where: { id }
    });

    if (!existingTruck) {
      return res.status(404).json({
        success: false,
        message: 'Truck non trouvé'
      });
    }

    if (isActive === false) {
      const activeAssignmentsCount = await prisma.truckAssignment.count({
        where: {
          truckId: id,
          status: {
            in: ['ASSIGNED', 'CONFIRMED', 'IN_TRANSIT']
          }
        }
      });

      if (activeAssignmentsCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'لا يمكن أرشفة السيارة لأنها مرتبطة بطلب نشط'
        });
      }
    }

    const updateData = {};
    if (matricule) updateData.matricule = matricule;
    if (brand) updateData.brand = brand;
    if (model) updateData.model = model;
    if (year) updateData.year = parseInt(year);
    if (capacity !== undefined) updateData.capacity = parseFloat(capacity);
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const truck = await prisma.truck.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Truck mis à jour avec succès',
      data: { truck }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enregistre une maintenance
 * POST /api/trucks/:id/maintenance
 */
const addMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, description, cost, date, nextDueDate, documentUrl } = req.body;

    if (!type || !cost || !date) {
      return res.status(400).json({
        success: false,
        message: 'type, cost et date sont requis'
      });
    }

    const truck = await prisma.truck.findUnique({
      where: { id }
    });

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck non trouvé'
      });
    }

    const maintenance = await prisma.truckMaintenance.create({
      data: {
        truckId: id,
        type,
        description,
        cost: parseFloat(cost),
        date: new Date(date),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        documentUrl,
        createdById: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance enregistrée avec succès',
      data: { maintenance }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enregistre une consommation de carburant
 * POST /api/trucks/:id/fuel
 */
const addFuel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, cost, date, documentUrl } = req.body;

    if (!quantity || !cost || !date) {
      return res.status(400).json({
        success: false,
        message: 'quantity, cost et date sont requis'
      });
    }

    const truck = await prisma.truck.findUnique({
      where: { id }
    });

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck non trouvé'
      });
    }

    const fuel = await prisma.truckFuel.create({
      data: {
        truckId: id,
        quantity: parseFloat(quantity),
        cost: parseFloat(cost),
        date: new Date(date),
        documentUrl,
        createdById: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Consommation de carburant enregistrée avec succès',
      data: { fuel }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enregistre une charge
 * POST /api/trucks/:id/expense
 */
const addExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, description, cost, date, documentUrl } = req.body;

    if (!type || !cost || !date) {
      return res.status(400).json({
        success: false,
        message: 'type, cost et date sont requis'
      });
    }

    const truck = await prisma.truck.findUnique({
      where: { id }
    });

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck non trouvé'
      });
    }

    const expense = await prisma.truckExpense.create({
      data: {
        truckId: id,
        type,
        description,
        cost: parseFloat(cost),
        date: new Date(date),
        documentUrl,
        createdById: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Charge enregistrée avec succès',
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un truck
 * DELETE /api/trucks/:id
 */
const deleteTruck = async (req, res, next) => {
  try {
    const { id } = req.params;

    const truck = await prisma.truck.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assignments: true
          }
        }
      }
    });

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck non trouvé'
      });
    }

    if (truck._count.assignments > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف السيارة لأنها مرتبطة بسجل تعيينات. يمكنك تعطيلها بدلاً من الحذف.'
      });
    }

    await prisma.truck.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Truck supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTrucks,
  getTruckById,
  getAvailableTrucks,
  createTruck,
  updateTruck,
  deleteTruck,
  addMaintenance,
  addFuel,
  addExpense
};

