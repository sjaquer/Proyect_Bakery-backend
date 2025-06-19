// src/controllers/userController.js

const User = require('../models/User');
const Customer = require('../models/Customer');

// Obtener el perfil del usuario autenticado unificando datos de User y Customer
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'phone', 'address'],
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const customer = await Customer.findByPk(req.user.id);

    return res.json({
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      phone: user.phone || (customer ? customer.phone : null),
      address: user.address || (customer ? customer.address : null),
    });
  } catch (err) {
    console.error('Error getProfile:', err);
    return res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

// Actualizar los datos de Customer del usuario autenticado
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    await user.save();

    let customer = await Customer.findByPk(userId);
    if (!customer) {
      customer = await Customer.create({
        id: userId,
        name: user.name,
        phone: user.phone || '',
        email: user.email,
        address: user.address || '',
      });
    } else {
      if (name !== undefined) customer.name = name;
      if (phone !== undefined) customer.phone = phone;
      if (email !== undefined) customer.email = email;
      if (address !== undefined) customer.address = address;
      await customer.save();
    }

    return res.json({
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      phone: user.phone,
      address: user.address,
    });
  } catch (err) {
    console.error('Error updateProfile:', err);
    return res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

