const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
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
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'clerk'],
      default: 'clerk',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('passwordHash')) {
    next();
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Transform to remove passwordHash from JSON responses
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

// Instance method to compare passwords (robust to legacy data)
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Prefer current hashed field, fallback to legacy 'password' if present
  const stored = this.passwordHash || this.password;

  // If nothing stored, treat as invalid credentials
  if (!stored || typeof stored !== 'string') {
    return false;
  }

  // If it looks like a bcrypt hash, compare securely
  const isBcryptHash = /^\$2[aby]\$/.test(stored);
  if (isBcryptHash) {
    return await bcrypt.compare(enteredPassword, stored);
  }

  // Fallback: legacy plain-text password (not ideal, but avoids runtime error)
  return enteredPassword === stored;
};

module.exports = mongoose.model('User', userSchema);
