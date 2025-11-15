const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a supplier name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    address: {
      type: String,
      required: [true, 'Please provide an address'],
      trim: true,
    },
    gstNo: {
      type: String,
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
supplierSchema.index({ email: 1 });
supplierSchema.index({ gstNo: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
