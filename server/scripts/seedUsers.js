const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    
    // Clear existing test users
    await User.deleteMany({ email: { $in: ['admin@test.com', 'donor@test.com', 'requester@test.com'] } });

    // Test users
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'Test Donor',
        email: 'donor@test.com',
        password: 'password123',
        role: 'donor'
      },
      {
        name: 'Test Requester',
        email: 'requester@test.com',
        password: 'password123',
        role: 'requester'
      }
    ];

    // Create users with hashed passwords
    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        name: user.name,
        email: user.email,
        password_hash: hashedPassword,
        role: user.role,
        is_active: true
      });
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin:     admin@test.com / password123');
    console.log('Donor:     donor@test.com / password123');
    console.log('Requester: requester@test.com / password123');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedUsers();
