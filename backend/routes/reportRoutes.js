const express = require('express');
const {
  getSalesAnalytics,
  getTopProducts,
  getLowStockReport,
  getNearExpiryReport,
  getInventorySummary,
} = require('../controllers/reportController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// All reporting routes require authentication
router.use(protect);

// @route   GET /api/reports/sales
// @desc    Get sales analytics (daily, monthly, yearly)
// @access  Private (Admin, Manager)
// @query   startDate, endDate, groupBy (daily|monthly|yearly)
router.get('/sales', authorize('admin', 'manager'), getSalesAnalytics);

// @route   GET /api/reports/top-products
// @desc    Get top-selling products by value
// @access  Private (Admin, Manager)
// @query   limit, startDate, endDate
router.get('/top-products', authorize('admin', 'manager'), getTopProducts);

// @route   GET /api/reports/low-stock
// @desc    Get products with low stock levels
// @access  Private (All roles)
// @query   threshold, sortBy (stock|value|category)
router.get('/low-stock', getLowStockReport);

// @route   GET /api/reports/near-expiry
// @desc    Get batches expiring soon with urgency categorization
// @access  Private (All roles)
// @query   days, sortBy (expiry|quantity|product)
router.get('/near-expiry', getNearExpiryReport);

// @route   GET /api/reports/inventory-summary
// @desc    Get overall inventory summary with category breakdown
// @access  Private (All roles)
router.get('/inventory-summary', getInventorySummary);

module.exports = router;
