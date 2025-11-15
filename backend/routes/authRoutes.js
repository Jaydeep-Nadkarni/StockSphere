const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Public route: User login
// @route   POST /api/auth/login
// @desc    Authenticate user and receive JWT token
// @access  Public
router.post('/login', login);

// Protected route: Register new user (Admin only)
// @route   POST /api/auth/register
// @desc    Create new user account
// @access  Private (Admin only)
router.post('/register', protect, authorize('admin'), register);

// Protected route: Get current user
// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;
