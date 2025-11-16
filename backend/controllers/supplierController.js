const Supplier = require('../models/Supplier');

// @desc    Get all suppliers with search and pagination
// @route   GET /api/suppliers
// @access  Private (All roles)
exports.getAllSuppliers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'name' } = req.query;

    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { gstNo: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const suppliers = await Supplier.find(filter)
      .sort({ [sortBy]: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Supplier.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        suppliers,
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

// @desc    Get single supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private (All roles)
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { supplier },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private (Admin, Manager)
exports.createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, gstNo } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const existingSupplier = await Supplier.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: existingSupplier.email === email ? 'Supplier with this email already exists' : 'Supplier with this phone already exists',
      });
    }

    const supplier = await Supplier.create({
      name,
      email,
      phone,
      address,
      gstNo,
    });

    res.status(201).json({
      success: true,
      data: { supplier },
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

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin, Manager)
exports.updateSupplier = async (req, res) => {
  try {
    let supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    const { name, email, phone, address, gstNo } = req.body;

    if (email && email !== supplier.email) {
      const existing = await Supplier.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
    }

    if (phone && phone !== supplier.phone) {
      const existing = await Supplier.findOne({ phone });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use',
        });
      }
    }

    if (name) supplier.name = name;
    if (email) supplier.email = email;
    if (phone) supplier.phone = phone;
    if (address) supplier.address = address;
    if (gstNo) supplier.gstNo = gstNo;

    supplier = await supplier.save();

    res.status(200).json({
      success: true,
      data: { supplier },
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

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
