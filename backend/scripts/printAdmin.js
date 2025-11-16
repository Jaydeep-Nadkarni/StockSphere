const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI is not set.');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, { dbName: 'wholesale_inventory' });
    const admins = await User.find({ role: 'admin' }).lean();
    if (!admins.length) {
      console.log('No admin users found.');
    } else {
      console.log(`Found ${admins.length} admin user(s):`);
      admins.forEach(a => {
        console.log({ id: a._id.toString(), email: a.email, name: a.name, role: a.role, createdAt: a.createdAt });
      });
    }
  } catch (err) {
    console.error('Error querying admin users:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

main();