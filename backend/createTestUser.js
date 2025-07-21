const mongoose = require('mongoose');
const User = require('./models/User');
const TimesheetEntry = require('./models/TimesheetEntry');
require('dotenv').config();

const createTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timesheet-tracker');
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists and remove it
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      await TimesheetEntry.deleteMany({ owner: existingUser._id });
      await User.deleteOne({ email: 'test@example.com' });
      console.log('🗑️  Removed existing test user and data');
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    await testUser.save();
    console.log('👤 Test user created:', testUser.email);

    // Create some realistic test timesheet entries
    const today = new Date();
    const testEntries = [
      // Today's entry
      {
        owner: testUser._id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        project: 'Website Development',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0, 0),
        hoursWorked: 8,
        description: 'Working on user authentication system and JWT implementation'
      },
      // Yesterday's entry
      {
        owner: testUser._id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        project: 'Mobile App',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 10, 0, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 14, 30, 0),
        hoursWorked: 4.5,
        description: 'Bug fixes in React Native components and testing'
      },
      // Day before yesterday
      {
        owner: testUser._id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
        project: 'Database Optimization',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 8, 30, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 12, 30, 0),
        hoursWorked: 4,
        description: 'MongoDB query optimization and indexing improvements'
      },
      // Last week entries
      {
        owner: testUser._id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
        project: 'API Development',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 9, 15, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 16, 45, 0),
        hoursWorked: 7.5,
        description: 'REST API endpoints for timesheet management'
      },
      {
        owner: testUser._id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
        project: 'Frontend Development',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 10, 0, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 18, 0, 0),
        hoursWorked: 8,
        description: 'React component development and Redux state management'
      },
      // Additional entries for better data visualization
      {
        owner: testUser._id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
        project: 'Code Review',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 14, 0, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 16, 0, 0),
        hoursWorked: 2,
        description: 'Code review and documentation updates'
      },
      {
        owner: testUser._id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4),
        project: 'Meeting & Planning',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4, 11, 0, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4, 12, 30, 0),
        hoursWorked: 1.5,
        description: 'Sprint planning and team standup meetings'
      }
    ];

    await TimesheetEntry.insertMany(testEntries);
    console.log('📊 Test timesheet entries created:', testEntries.length, 'entries');

    // Calculate total hours
    const totalHours = testEntries.reduce((total, entry) => {
      return total + entry.hoursWorked;
    }, 0);

    console.log('\n🎉 Test data creation completed successfully!');
    console.log('\n=== TEST ACCOUNT CREDENTIALS ===');
    console.log('Email:    test@example.com');
    console.log('Password: password123');
    console.log('================================');
    console.log(`\n📈 Sample Data Created:`);
    console.log(`   • ${testEntries.length} timesheet entries`);
    console.log(`   • ${totalHours.toFixed(1)} total hours logged`);
    console.log(`   • ${new Set(testEntries.map(e => e.project)).size} different projects`);
    console.log('\n🚀 You can now login at: http://localhost:3000/login');
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createTestData();
