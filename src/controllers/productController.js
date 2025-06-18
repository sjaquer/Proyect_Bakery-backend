// src/controllers/productController.js
// ------------------------------------
// Aquí va la lógica de cada endpoint de productos: 
// - getAllProducts, getProductById, createProduct, updateProduct, deleteProduct

const Product = require('../models/Product');
const categoryLabels = require('../utils/categoryLabels');

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
    res.json(products);
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
    res.json(product);
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
    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({ message: 'El stock debe ser 0 o mayor' });
    }
    const newProduct = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
    });
    res.status(201).json(newProduct);
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
    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({ message: 'El stock debe ser 0 o mayor' });
    }
    const [updated] = await Product.update(
      { name, description, price, stock, category, imageUrl },
      { where: { id: req.params.id } }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    const updatedProduct = await Product.findByPk(req.params.id);
    res.json(updatedProduct);
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

// @route   PATCH /api/products/:id/stock
// @desc    Actualizar solo el stock de un producto
// @access  Privado (admin)
exports.updateProductStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ message: 'El stock debe ser un entero mayor o igual a 0' });
    }
    const [updated] = await Product.update(
      { stock: Number(stock) },
      { where: { id: req.params.id } }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    const updatedProduct = await Product.findByPk(req.params.id, {
      attributes: ['id', 'name', 'stock']
    });
    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/products/categories
// @desc    Obtener lista de categorías en español
// @access  Público
exports.getCategories = (req, res) => {
  const cats = Object.entries(categoryLabels).map(([key, label]) => ({ key, name: label }));
  res.json([{ key: 'all', name: 'Todos' }, ...cats]);
};