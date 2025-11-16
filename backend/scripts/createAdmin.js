const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGO_URI or MONGODB_URI is not set');
    }
    await mongoose.connect(uri);
    console.log('📡 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      // Ensure the admin has a known password
      existingAdmin.passwordHash = 'admin123';
      await existingAdmin.save();
      console.log('✅ Admin user already exists — password reset to admin123');
      process.exit(0);
    }

    // Create admin user (plain password; model pre-save will hash)
    const adminUser = new User({
      name: 'Administrator',
      email: 'admin@example.com',
      passwordHash: 'admin123',
      role: 'admin',
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();
