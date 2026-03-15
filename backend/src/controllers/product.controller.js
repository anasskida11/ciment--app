const prisma = require('../utils/prisma.util');
const { createNotification } = require('../services/notification.service');

/**
 * Récupère tous les produits
 * GET /api/products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un produit par ID
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée un nouveau produit
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, unit, price, stock, minStock } = req.body;

    // Validation
    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le prix sont requis'
      });
    }

    // Création du produit
    const product = await prisma.product.create({
      data: {
        name,
        description,
        unit: unit || 'tonne',
        price: parseFloat(price),
        stock: stock ? parseFloat(stock) : 0,
        minStock: minStock ? parseFloat(minStock) : 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour un produit
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, unit, price, stock, minStock, isActive } = req.body;

    // Vérification si le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Préparation des données de mise à jour
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (unit) updateData.unit = unit;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseFloat(stock);
    if (minStock !== undefined) updateData.minStock = parseFloat(minStock);
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const previousStock = parseFloat(existingProduct.stock);
    const nextStock = stock !== undefined ? parseFloat(stock) : previousStock;
    const stockChanged = stock !== undefined && nextStock !== previousStock;

    // Mise à jour
    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    if (stockChanged && req.user?.id) {
      await createNotification(
        req.user.id,
        'GENERAL',
        'تعديل المخزون الحالي',
        `تم تعديل المخزون الحالي للمنتج ${product.name} من ${previousStock} إلى ${nextStock}`
      );
    }

    res.status(200).json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un produit
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Vérification si le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Suppression
    await prisma.product.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

