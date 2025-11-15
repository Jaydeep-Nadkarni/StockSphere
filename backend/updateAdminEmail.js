require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateAdminEmail = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateOne(
      { email: 'admin@example.com' },
      { email: 'ashmit123@gmail.com' }
    );

    console.log('Update result:', result);
    console.log('✅ Admin email updated successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateAdminEmail();