// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();

const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;

