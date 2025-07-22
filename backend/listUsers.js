const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timesheet-tracker');
    console.log('✅ Connected to MongoDB');

    const users = await User.find({}, 'name email createdAt').sort({ createdAt: -1 });
    
    console.log('\n👥 ALL REGISTERED USERS:');
    console.log('='.repeat(60));
    
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${user.createdAt.toLocaleString()}`);
        console.log(`   ID: ${user._id}`);
        console.log('   ' + '-'.repeat(50));
      });
    }
    
    console.log(`\n📊 Total Users: ${users.length}`);
    console.log('='.repeat(60));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

listUsers();
