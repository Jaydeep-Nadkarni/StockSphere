const Batch = require('../models/Batch');
const Product = require('../models/Product');

// Helper function to update product stock
const updateProductStock = async (productId) => {
  try {
    const batches = await Batch.find({ productId });
    const totalStock = batches.reduce((sum, batch) => sum + batch.quantity, 0);
    await Product.findByIdAndUpdate(productId, { currentStock: totalStock });
  } catch (error) {
    console.error('Error updating product stock:', error.message);
  }
};

// @desc    Get all batches for a specific product
// @route   GET /api/batches/:productId
// @access  Private (All roles)
exports.getBatchesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { includeExpired = false, nearExpiry } = req.query;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Build filter
    let filter = { productId };

    if (!includeExpired) {
      // Exclude expired batches
      filter.expiryDate = { $gt: new Date() };
    }

    // Query batches
    let batches = await Batch.find(filter)
      .populate('productId', 'name sku price')
      .sort({ expiryDate: 1 });

    // Filter near expiry if specified
    if (nearExpiry) {
      const days = parseInt(nearExpiry) || 30;
      const now = new Date();
      const thresholdDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      batches = batches.filter((batch) => {
        return batch.expiryDate <= thresholdDate && batch.expiryDate > now;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        batches,
        productId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single batch by ID
// @route   GET /api/batches/detail/:id
// @access  Private (All roles)
exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate(
      'productId',
      'name sku price category'
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        batch,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new batch
// @route   POST /api/batches
// @access  Private (Admin, Manager)
exports.createBatch = async (req, res) => {
  try {
    const { productId, batchNo, quantity, manufacturedDate, expiryDate } =
      req.body;

    // Validate required fields
    if (
      !productId ||
      !batchNo ||
      quantity === undefined ||
      !manufacturedDate ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all required fields: productId, batchNo, quantity, manufacturedDate, expiryDate',
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if batchNo already exists
    const existingBatch = await Batch.findOne({ batchNo: batchNo.toUpperCase() });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'Batch with this number already exists',
      });
    }

    // Validate dates
    const mfgDate = new Date(manufacturedDate);
    const expDate = new Date(expiryDate);

    if (expDate <= mfgDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be after manufactured date',
      });
    }

    // Validate quantity
    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative',
      });
    }

    // Create batch
    const batch = await Batch.create({
      productId,
      batchNo,
      quantity,
      manufacturedDate: mfgDate,
      expiryDate: expDate,
    });

    // Update parent product's currentStock
    await updateProductStock(productId);

    res.status(201).json({
      success: true,
      data: {
        batch,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(', ');
      return res.status(400).json({
        success: false,
        message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private (Admin, Manager)
exports.updateBatch = async (req, res) => {
  try {
    const { quantity, manufacturedDate, expiryDate } = req.body;

    // Get existing batch
    let batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    const oldQuantity = batch.quantity;

    // Update allowed fields (not productId or batchNo)
    if (quantity !== undefined) {
      if (quantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity cannot be negative',
        });
      }
      batch.quantity = quantity;
    }

    if (manufacturedDate) batch.manufacturedDate = new Date(manufacturedDate);
    if (expiryDate) batch.expiryDate = new Date(expiryDate);

    // Validate dates
    if (batch.expiryDate <= batch.manufacturedDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be after manufactured date',
      });
    }

    // Save updated batch
    batch = await batch.save();

    // Update parent product stock if quantity changed
    if (quantity !== undefined && quantity !== oldQuantity) {
      await updateProductStock(batch.productId);
    }

    res.status(200).json({
      success: true,
      data: {
        batch,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(', ');
      return res.status(400).json({
        success: false,
        message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private (Admin only)
exports.deleteBatch = async (req, res) => {
  try {
    // Get batch details before deletion
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    const productId = batch.productId;

    // Delete batch
    await Batch.findByIdAndDelete(req.params.id);

    // Update parent product stock
    await updateProductStock(productId);

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get batches near expiry
// @route   GET /api/batches/near-expiry
// @access  Private (All roles)
exports.getNearExpiryBatches = async (req, res) => {
  try {
    const days = req.query.days || 30;
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const batches = await Batch.find({
      expiryDate: { $lte: thresholdDate, $gt: now },
    })
      .populate('productId', 'name sku price category')
      .sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        batches,
        count: batches.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get expired batches
// @route   GET /api/batches/expired
// @access  Private (All roles)
exports.getExpiredBatches = async (req, res) => {
  try {
    const now = new Date();

    const batches = await Batch.find({
      expiryDate: { $lt: now },
    })
      .populate('productId', 'name sku price category')
      .sort({ expiryDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        batches,
        count: batches.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { updateProductStock };
