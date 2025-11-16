const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Batch = require('../models/Batch');
const Customer = require('../models/Customer');
const { emitNewOrder, emitOrderStatusChanged } = require('../utils/socket');

// Helper function to update product stock after order changes
const updateProductStock = async (productId) => {
  const batches = await Batch.find({ productId });
  const totalStock = batches.reduce((sum, batch) => sum + batch.quantity, 0);
  await Product.findByIdAndUpdate(productId, { currentStock: totalStock });
};

// @desc    Get all orders with filtering and pagination
// @route   GET /api/orders
// @access  Private (All roles)
exports.getAllOrders = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sortBy = 'createdAt' } =
      req.query;

    let filter = {};
    if (search) {
      filter.$or = [
        { orderNo: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        orders,
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

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (All roles)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .populate('createdBy', 'name email')
      .populate('items.productId', 'name sku category')
      .populate('items.batchId', 'batchNo expiryDate');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new order with stock management
// @route   POST /api/orders
// @access  Private (All roles)
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId, items, discount = 0, notes } = req.body;

    // Validate required fields
    if (!customerId || !items || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please provide customerId and at least one item',
      });
    }

    // Verify customer exists
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Validate all items and check stock
    const validatedItems = [];
    for (const item of items) {
      const { productId, quantity } = item;

      // Verify product exists
      const product = await Product.findById(productId).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Product ${productId} not found`,
        });
      }

      // Check if quantity is available in current stock
      if (product.currentStock < quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${quantity}`,
        });
      }

      validatedItems.push({
        productId,
        quantity: parseInt(quantity),
        price: product.price,
      });
    }

    // Deduct quantities from product stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { currentStock: -item.quantity } },
        { session }
      );
    }

    // Create order
    const order = await Order.create(
      [
        {
          customerId,
          items: validatedItems,
          discount,
          notes,
          createdBy: req.user.id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Populate for response
    const populatedOrder = await Order.findById(order[0]._id)
      .populate('customerId', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('items.productId', 'name sku');

    // Emit Socket.IO event
    emitNewOrder({
      orderId: order[0]._id,
      orderNo: order[0].orderNo,
      customer: populatedOrder.customerId,
      totalAmount: order[0].netAmount,
    });

    res.status(201).json({
      success: true,
      data: { order: populatedOrder },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// @desc    Update order (only if Pending)
// @route   PUT /api/orders/:id
// @access  Private (Admin, Manager)
exports.updateOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Can only update if status is Pending
    if (order.status !== 'Pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot update order with status ${order.status}`,
      });
    }

    const { items, discount, notes } = req.body;

    // If items are being changed, restore old quantities first
    if (items) {
      for (const oldItem of order.items) {
        await Product.findByIdAndUpdate(
          oldItem.productId,
          { $inc: { currentStock: oldItem.quantity } },
          { session }
        );
      }

      // Validate and deduct new items
      const validatedItems = [];
      for (const item of items) {
        const { productId, quantity } = item;

        const product = await Product.findById(productId).session(session);
        if (!product) {
          await session.abortTransaction();
          return res.status(404).json({
            success: false,
            message: `Product ${productId} not found`,
          });
        }

        if (product.currentStock < quantity) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`,
          });
        }

        validatedItems.push({
          productId,
          quantity: parseInt(quantity),
          price: product.price,
        });
      }

      // Deduct new quantities
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { currentStock: -item.quantity } },
          { session }
        );
      }

      order.items = validatedItems;
    }

    if (discount !== undefined) order.discount = discount;
    if (notes !== undefined) order.notes = notes;

    // Pre-save hook will recalculate totals
    await order.save({ session });
    await session.commitTransaction();

    const updatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email phone')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: { order: updatedOrder },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// @desc    Delete order (restore all quantities)
// @route   DELETE /api/orders/:id
// @access  Private (Admin)
exports.deleteOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Restore all product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { currentStock: item.quantity } },
        { session }
      );
    }

    await Order.findByIdAndDelete(req.params.id, { session });
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully and stock restored',
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin, Manager)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new status',
      });
    }

    // Use order's updateStatus method for validation
    order.updateStatus(status);
    await order.save();

    // Emit Socket.IO event
    emitOrderStatusChanged({
      orderId: order._id,
      orderNo: order.orderNo,
      status: order.status,
    });

    const updatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email phone')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: { order: updatedOrder },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order invoice
// @route   GET /api/orders/:id/invoice
// @access  Private (All roles)
exports.getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .populate('createdBy', 'name email')
      .populate('items.productId', 'name sku category')
      .populate('items.batchId', 'batchNo');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
