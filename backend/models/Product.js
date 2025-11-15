const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'Please provide a SKU'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Please provide a unit'],
      enum: {
        values: ['kg', 'liter', 'piece', 'box', 'carton'],
        message: 'Unit must be one of: kg, liter, piece, box, carton',
      },
      default: 'piece',
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
      set: (value) => Math.round(value * 100) / 100, // 2 decimal precision
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier', // Reference to Supplier model (Phase 3)
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for fast lookups
productSchema.index({ sku: 1 });
productSchema.index({ supplierId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ currentStock: 1 }); // For low-stock queries
productSchema.index({ createdAt: 1 }); // For date-range queries
productSchema.index({ price: 1 }); // For price-based sorting
productSchema.index({ category: 1, currentStock: 1 }); // Compound for category filtering

// Virtual field for low stock status
productSchema.virtual('isLowStock').get(function () {
  return this.currentStock < 10;
});

// Instance method to update stock
productSchema.methods.updateStock = async function (quantity) {
  const newStock = this.currentStock + quantity;
  if (newStock < 0) {
    throw new Error('Insufficient stock available');
  }
  this.currentStock = newStock;
  return await this.save();
};

// Transform to include virtuals in JSON
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
