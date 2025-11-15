const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide a product ID'],
    },
    batchNo: {
      type: String,
      required: [true, 'Please provide a batch number'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide a quantity'],
      min: [0, 'Quantity cannot be negative'],
    },
    manufacturedDate: {
      type: Date,
      required: [true, 'Please provide a manufactured date'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide an expiry date'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for fast queries
batchSchema.index({ productId: 1, batchNo: 1 });
batchSchema.index({ expiryDate: 1 });
batchSchema.index({ productId: 1 });
batchSchema.index({ expiryDate: 1, productId: 1 }); // Compound for near-expiry queries
batchSchema.index({ createdAt: 1 }); // For date-range queries
batchSchema.index({ productId: 1, expiryDate: 1 }); // Compound for product batch queries

// Pre-save validation: expiryDate must be after manufacturedDate
batchSchema.pre('save', function (next) {
  if (this.expiryDate <= this.manufacturedDate) {
    throw new Error('Expiry date must be after manufactured date');
  }
  next();
});

// Instance method to check if batch is expired
batchSchema.methods.isExpired = function () {
  return new Date() > this.expiryDate;
};

// Instance method to check if batch is near expiry
batchSchema.methods.isNearExpiry = function (days = 30) {
  const now = new Date();
  const expiryTime = this.expiryDate.getTime();
  const nowTime = now.getTime();
  const daysInMs = days * 24 * 60 * 60 * 1000;

  return expiryTime <= nowTime + daysInMs && expiryTime > nowTime;
};

// Instance method to deduct quantity
batchSchema.methods.deductQuantity = async function (amount) {
  if (amount > this.quantity) {
    throw new Error('Insufficient quantity in batch');
  }
  this.quantity -= amount;
  return await this.save();
};

module.exports = mongoose.model('Batch', batchSchema);
