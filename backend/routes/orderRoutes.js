const express = require('express');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrderInvoice,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET routes
router.get('/invoice/:id', getOrderInvoice);
router.get('/:id', getOrderById);
router.get('/', getAllOrders);

// POST route - All authenticated users
router.post('/', createOrder);

// PUT route - Admin or Manager
router.put('/:id', authorize('admin', 'manager'), updateOrder);

// PATCH route for status updates - Admin or Manager
router.patch('/:id/status', authorize('admin', 'manager'), updateOrderStatus);

// DELETE route - Admin only
router.delete('/:id', authorize('admin'), deleteOrder);

module.exports = router;
