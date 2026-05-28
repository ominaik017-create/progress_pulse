require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@progresspulse.com' });
    if (existing) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@progresspulse.com',
      password: 'admin123',
      role: 'admin',
      isVerifiedCreator: true,
    });

    console.log('Admin created successfully!');
    console.log('Email: admin@progresspulse.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
