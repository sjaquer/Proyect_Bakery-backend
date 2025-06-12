// src/controllers/productController.js
// ------------------------------------
// Aquí va la lógica de cada endpoint de productos: 
// - getAllProducts, getProductById, createProduct, updateProduct, deleteProduct

const { Product } = require('../models');

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
        'stock',        // <-- asegúrate de incluir stock
        'createdAt',
        'updatedAt'
      ]
    });
    return res.json(products);
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
      attributes: ['id', 'name', 'description', 'price', 'stock']
    });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    return res.json(product);
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/products
// @desc    Crear un nuevo producto
// @access  Privado (admin)
exports.createProduct = async (req, res) => {
  const { name, description, price, stock, category, imageUrl } = req.body;
  try {
    const newProduct = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
    });
    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error en createProduct:', error);
    return res.status(500).json({ message: 'Error al crear el producto' });
  }
};

// @route   PUT /api/products/:id
// @desc    Actualizar producto por ID
// @access  Privado (admin)
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category, imageUrl } = req.body;
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    product.name = name !== undefined ? name : product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.category = category !== undefined ? category : product.category;
    product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
    await product.save();
    return res.json(product);
  } catch (error) {
    console.error('Error en updateProduct:', error);
    return res.status(500).json({ message: 'Error al actualizar el producto' });
  }
};

// @route   DELETE /api/products/:id
// @desc    Eliminar producto por ID
// @access  Privado (admin)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    await product.destroy();
    return res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteProduct:', error);
    return res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};
