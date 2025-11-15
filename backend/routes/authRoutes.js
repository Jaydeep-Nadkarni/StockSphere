const express = require('express');
const { adminLogin, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Public route: Admin login
// @route   POST /api/auth/admin/login
// @desc    Authenticate admin and receive JWT token
// @access  Public (Admin role only)
router.post('/admin/login', adminLogin);

// Public route: User login (Clerk & Manager)
// @route   POST /api/auth/login
// @desc    Authenticate user (clerk/manager) and receive JWT token
// @access  Public (Non-admin roles)
router.post('/login', login);

// Protected route: Get current user
// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;
