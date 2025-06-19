// src/controllers/userController.js

const User = require('../models/User');
const Customer = require('../models/Customer');

// Obtener el perfil del usuario autenticado unificando datos de User y Customer
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
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
      phone: customer ? customer.phone : null,
      address: customer ? customer.address : null,
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

    let customer = await Customer.findByPk(userId);
    if (!customer) {
      customer = await Customer.create({
        id: userId,
        name: name || '',
        phone: phone || '',
        email: email || '',
        address: address || '',
      });
    } else {
      if (name !== undefined) customer.name = name;
      if (phone !== undefined) customer.phone = phone;
      if (email !== undefined) customer.email = email;
      if (address !== undefined) customer.address = address;
      await customer.save();
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
    });

    return res.json({
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      phone: customer.phone,
      address: customer.address,
    });
  } catch (err) {
    console.error('Error updateProfile:', err);
    return res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

