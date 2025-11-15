const express = require('express');
const {
  getBatchesByProduct,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getNearExpiryBatches,
  getExpiredBatches,
} = require('../controllers/batchController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// All batch routes require authentication
router.use(protect);

// @route   GET /api/batches/near-expiry
// @desc    Get batches expiring soon (within 30 days by default)
// @access  Private (All authenticated users)
router.get('/near-expiry', getNearExpiryBatches);

// @route   GET /api/batches/expired
// @desc    Get all expired batches
// @access  Private (All authenticated users)
router.get('/expired', getExpiredBatches);

// @route   GET /api/batches/detail/:id
// @desc    Get single batch by batch ID
// @access  Private (All authenticated users)
router.get('/detail/:id', getBatchById);

// @route   GET /api/batches/:productId
// @desc    Get all batches for a specific product (FIFO sorted by expiry)
// @access  Private (All authenticated users)
router.get('/:productId', getBatchesByProduct);

// @route   POST /api/batches
// @desc    Create new batch (auto-updates product stock)
// @access  Private (Admin, Manager only)
router.post('/', authorize('admin', 'manager'), createBatch);

// @route   PUT /api/batches/:id
// @desc    Update batch details (recalculates product stock if quantity changes)
// @access  Private (Admin, Manager only)
router.put('/:id', authorize('admin', 'manager'), updateBatch);

// @route   DELETE /api/batches/:id
// @desc    Delete batch (auto-updates product stock)
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), deleteBatch);

module.exports = router;
