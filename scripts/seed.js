/**
 * Seed script to create test users in MongoDB
 * Run with: npm run seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const TEST_USERS = [
  {
    email: 'bodheesh@kms.com',
    name: 'Bodheesh V C',
    password: 'Demo@123',
    role: 'Admin',
    active: true,
  },
  {
    email: 'bodheesh.lead@kms.com',
    name: 'Bodheesh V C (TeamLead)',
    password: 'Demo@123',
    role: 'TeamLead',
    active: true,
  },
  {
    email: 'engineer@kms.com',
    name: 'John Engineer',
    password: 'Demo@123',
    role: 'Engineer',
    active: true,
  },
  {
    email: 'lead@kms.com',
    name: 'Sarah Lead',
    password: 'Demo@123',
    role: 'TeamLead',
    active: true,
  },
  {
    email: 'manager@kms.com',
    name: 'Mike Manager',
    password: 'Demo@123',
    role: 'Manager',
    active: true,
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not configured in .env.local');
    }

    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Define User schema
    const userSchema = new mongoose.Schema(
      {
        email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
        },
        name: {
          type: String,
          required: true,
        },
        password: {
          type: String,
          required: true,
          select: false,
        },
        role: {
          type: String,
          enum: ['Engineer', 'TeamLead', 'Manager', 'Admin'],
          default: 'Engineer',
        },
        avatar: String,
        active: {
          type: Boolean,
          default: true,
        },
      },
      { timestamps: true }
    );

    const User = mongoose.model('User', userSchema);

    // Clear existing users
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});

    // Create test users
    console.log('👥 Creating test users...');
    for (const userData of TEST_USERS) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      await user.save();
      console.log(`  ✅ Created: ${userData.email} (${userData.role})`);
    }

    console.log('\n✅ Seeding complete!');
    console.log('\n📝 Test Credentials:');
    TEST_USERS.forEach((user) => {
      console.log(`\n  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Role: ${user.role}`);
    });

    console.log('\n🔗 Login at: http://localhost:3001/auth/login');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
