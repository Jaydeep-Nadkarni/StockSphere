const Customer = require('../models/Customer');

// @desc    Get all customers with search and pagination
// @route   GET /api/customers
// @access  Private (All roles)
exports.getAllCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'name' } = req.query;

    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const customers = await Customer.find(filter)
      .sort({ [sortBy]: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        customers,
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

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private (All roles)
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (All roles)
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email or phone already exists',
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
    });

    res.status(201).json({
      success: true,
      data: { customer },
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

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Admin, Manager)
exports.updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const { name, email, phone, address } = req.body;

    if (email && email !== customer.email) {
      const existing = await Customer.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
    }

    if (phone && phone !== customer.phone) {
      const existing = await Customer.findOne({ phone });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use',
        });
      }
    }

    if (name) customer.name = name;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;
    if (address) customer.address = address;

    customer = await customer.save();

    res.status(200).json({
      success: true,
      data: { customer },
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

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin)
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
