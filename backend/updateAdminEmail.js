require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Usage:
//   node backend/updateAdminEmail.js oldEmail newEmail
// Defaults:
//   oldEmail = 'admin@example.com'
//   newEmail = process.env.ADMIN_NEW_EMAIL or prompt-like example
const [,, oldArg, newArg] = process.argv;
const OLD_EMAIL = oldArg || 'admin@example.com';
const NEW_EMAIL = newArg || process.env.ADMIN_NEW_EMAIL || 'admin@example.com';

const updateAdminEmail = async () => {
  try {
    // Prefer MONGO_URI, fallback to MONGODB_URI
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGO_URI or MONGODB_URI is not set in environment');
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: OLD_EMAIL });
    if (!admin) {
      console.log(`No user found with email '${OLD_EMAIL}'.`);
      process.exit(0);
    }

    if (OLD_EMAIL === NEW_EMAIL) {
      console.log('OLD_EMAIL and NEW_EMAIL are the same; nothing to update.');
      process.exit(0);
    }

    const result = await User.updateOne(
      { email: OLD_EMAIL },
      { email: NEW_EMAIL }
    );

    console.log('Update result:', result);
    console.log(`✅ Admin email updated from '${OLD_EMAIL}' to '${NEW_EMAIL}'`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

updateAdminEmail();