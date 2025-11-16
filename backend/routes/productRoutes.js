const express = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  updateProductStock,
} = require('../controllers/productController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// All product routes require authentication
router.use(protect);

// @route   GET /api/products/low-stock
// @desc    Get products with low stock levels
// @access  Private (All authenticated users)
router.get('/low-stock', getLowStockProducts);

// @route   GET /api/products
// @desc    Get all products with optional filters and pagination
// @access  Private (All authenticated users)
router.get('/', getAllProducts);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Private (All authenticated users)
router.get('/:id', getProductById);

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin, Manager only)
router.post('/', authorize('admin', 'manager'), createProduct);

// @route   PUT /api/products/:id
// @desc    Update product details
// @access  Private (Admin, Manager only)
router.put('/:id', authorize('admin', 'manager'), updateProduct);

// @route   PUT /api/products/:id/stock
// @desc    Update product stock directly
// @access  Private (Admin, Manager only)
router.put('/:id/stock', authorize('admin', 'manager'), updateProductStock);

// @route   DELETE /api/products/:id
// @desc    Delete product (only if no batches exist)
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), deleteProduct);

module.exports = router;
