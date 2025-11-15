const express = require('express');
const router = express.Router();
const {
  getDailySummary,
  getLowStockAnalysis,
  generateBusinessReport,
  getOrderInsights,
  getDemandPrediction,
} = require('../controllers/aiAnalyticsController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

// @route   GET /api/ai/daily-summary
// @desc    Get AI-powered daily summary
// @access  Private (Admin, Manager)
router.get('/daily-summary', authorize('admin', 'manager'), getDailySummary);

// @route   GET /api/ai/low-stock-analysis
// @desc    Get AI low stock analysis
// @access  Private (Admin, Manager)
router.get('/low-stock-analysis', authorize('admin', 'manager'), getLowStockAnalysis);

// @route   POST /api/ai/business-report
// @desc    Generate comprehensive AI business report
// @access  Private (Admin only)
router.post('/business-report', authorize('admin'), generateBusinessReport);

// @route   GET /api/ai/order-insights/:orderId
// @desc    Get AI insights for specific order
// @access  Private (All authenticated users)
router.get('/order-insights/:orderId', getOrderInsights);

// @route   GET /api/ai/demand-prediction
// @desc    Get demand prediction for products
// @access  Private (Admin, Manager)
router.get('/demand-prediction', authorize('admin', 'manager'), getDemandPrediction);

module.exports = router;