const express = require('express');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);

// POST route - All authenticated users
router.post('/', createCustomer);

// PUT route - Admin or Manager
router.put('/:id', authorize('admin', 'manager'), updateCustomer);

// DELETE route - Admin only
router.delete('/:id', authorize('admin'), deleteCustomer);

module.exports = router;
