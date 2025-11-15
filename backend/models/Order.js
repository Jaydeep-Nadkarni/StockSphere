const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      unique: true,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Please provide a customer ID'],
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product ID is required for each item'],
        },
        batchId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Batch',
          required: [true, 'Batch ID is required for each item'],
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: [true, 'Price is required'],
          min: [0, 'Price cannot be negative'],
        },
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate orderNo before saving
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Order').countDocuments({
      orderNo: new RegExp(`^ORD-${dateStr}`),
    });
    this.orderNo = `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.subtotal = Math.round(this.subtotal * 100) / 100;
    
    this.netAmount = this.subtotal - this.discount + this.tax;
    this.netAmount = Math.round(this.netAmount * 100) / 100;
  }
  next();
});

// Create indexes
orderSchema.index({ orderNo: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: 1 });

// Instance method to calculate totals
orderSchema.methods.calculateTotals = function () {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.subtotal = Math.round(this.subtotal * 100) / 100;
    
    this.netAmount = this.subtotal - this.discount + this.tax;
    this.netAmount = Math.round(this.netAmount * 100) / 100;
  }
  return this;
};

// Instance method to update status
orderSchema.methods.updateStatus = async function (newStatus) {
  const validTransitions = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Delivered', 'Cancelled'],
    Delivered: [],
    Cancelled: [],
  };

  if (!validTransitions[this.status]?.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${this.status} to ${newStatus}`
    );
  }

  this.status = newStatus;
  return await this.save();
};

module.exports = mongoose.model('Order', orderSchema);
