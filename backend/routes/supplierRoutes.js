const express = require('express');
const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);

// POST route - Admin or Manager
router.post('/', authorize('admin', 'manager'), createSupplier);

// PUT route - Admin or Manager
router.put('/:id', authorize('admin', 'manager'), updateSupplier);

// DELETE route - Admin only
router.delete('/:id', authorize('admin'), deleteSupplier);

module.exports = router;
