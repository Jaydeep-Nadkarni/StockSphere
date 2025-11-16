const Product = require('../models/Product');
const Batch = require('../models/Batch');

// Helper function to recalculate product stock from batches
const recalculateStock = async (productId) => {
  try {
    const batches = await Batch.find({ productId });
    const totalStock = batches.reduce((sum, batch) => sum + batch.quantity, 0);
    await Product.findByIdAndUpdate(productId, { currentStock: totalStock });
  } catch (error) {
    console.error('Error recalculating stock:', error.message);
  }
};

// @desc    Get all products with optional filters and pagination
// @route   GET /api/products
// @access  Private (All roles)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, sortBy, page = 1, limit = 10 } = req.query;

    // Build filter object
    let filter = {};
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    let sortObj = { createdAt: -1 };
    if (sortBy === 'price') {
      sortObj = { price: 1 };
    } else if (sortBy === 'name') {
      sortObj = { name: 1 };
    } else if (sortBy === 'stock') {
      sortObj = { currentStock: 1 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Query products
    const products = await Product.find(filter)
      .populate('supplierId', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Product.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        products,
        total,
        page: parseInt(page),
        pages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private (All roles)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'supplierId',
      'name email'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get associated batches and calculate aggregate info
    const batches = await Batch.find({ productId: req.params.id });
    const batchCount = batches.length;

    res.status(200).json({
      success: true,
      data: {
        product: {
          ...product.toObject(),
          batchCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin, Manager)
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, category, unit, price } = req.body;

    // Validate required fields
    if (!name || !sku || !category || !unit || !price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, sku, category, unit, price',
      });
    }

    // Validate price is positive
    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number',
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists',
      });
    }

    // Create product
    const product = await Product.create({
      name,
      sku,
      category,
      unit,
      price,
      currentStock: 0,
    });

    res.status(201).json({
      success: true,
      data: {
        product,
      },
    });
  } catch (error) {
    // Handle validation errors
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

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Manager)
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, unit, price, supplierId } = req.body;

    // Validate product exists
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update allowed fields only (not SKU or currentStock)
    if (name) product.name = name;
    if (category) product.category = category;
    if (unit) product.unit = unit;
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a positive number',
        });
      }
      product.price = price;
    }
    if (supplierId) product.supplierId = supplierId;

    // Save updated product
    product = await product.save();

    res.status(200).json({
      success: true,
      data: {
        product,
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

// @desc    Update product stock directly
// @route   PUT /api/products/:id/stock
// @access  Private (Admin, Manager)
exports.updateProductStock = async (req, res) => {
  try {
    const { currentStock } = req.body;

    // Validate input
    const parsed = parseInt(currentStock, 10);
    if (isNaN(parsed) || parsed < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative integer',
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update stock
    product.currentStock = parsed;
    await product.save();

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    // Check if product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if product has associated batches
    const batchCount = await Batch.countDocuments({ productId: req.params.id });
    if (batchCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with existing batches',
      });
    }

    // Delete product
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private (All roles)
exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = req.query.threshold || 10;

    const products = await Product.find({ currentStock: { $lt: threshold } })
      .populate('supplierId', 'name email')
      .sort({ currentStock: 1 });

    res.status(200).json({
      success: true,
      data: {
        products,
        count: products.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
