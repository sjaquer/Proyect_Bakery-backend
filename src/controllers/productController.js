// src/controllers/productController.js
// ------------------------------------
// Aquí va la lógica de cada endpoint de productos: 
// - getAllProducts, getProductById, createProduct, updateProduct, deleteProduct

const Product = require('../models/Product');
const { toSpanish } = require('../utils/categoryTranslations');

// @route   GET /api/products
// @desc    Obtener todos los productos
// @access  Público
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      attributes: [
        'id',
        'name',
        'description',
        'price',
        'stock',
        'category',
        'imageUrl',
        'createdAt',
        'updatedAt'
      ]
    });
    const translated = products.map(p => {
      const plain = p.get({ plain: true });
      plain.categoryName = toSpanish(plain.category);
      return plain;
    });
    res.json(translated);
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/products/:id
// @desc    Obtener un producto por su ID
// @access  Público
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      attributes: ['id', 'name', 'description', 'price', 'stock', 'category', 'imageUrl']
    });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    const plain = product.get({ plain: true });
    plain.categoryName = toSpanish(plain.category);
    res.json(plain);
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/products
// @desc    Crear un nuevo producto
// @access  Privado (admin)
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;
    const newProduct = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
    });
    const plain = newProduct.get({ plain: true });
    plain.categoryName = toSpanish(plain.category);
    res.status(201).json(plain);
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/products/:id
// @desc    Actualizar producto por ID
// @access  Privado (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;
    const [updated] = await Product.update(
      { name, description, price, stock, category, imageUrl },
      { where: { id: req.params.id } }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    const updatedProduct = await Product.findByPk(req.params.id);
    const plain = updatedProduct.get({ plain: true });
    plain.categoryName = toSpanish(plain.category);
    res.json(plain);
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/products/:id
// @desc    Eliminar producto por ID
// @access  Privado (admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};