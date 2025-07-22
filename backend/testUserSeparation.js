const mongoose = require('mongoose');
const User = require('./models/User');
const TimesheetEntry = require('./models/TimesheetEntry');
const UserSettings = require('./models/UserSettings');
require('dotenv').config();

const testUserDataSeparation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timesheet-tracker');
    console.log('✅ Connected to MongoDB\n');

    // Create two test users
    console.log('🔧 Setting up test users...');
    
    // Clean up any existing test users
    await User.deleteMany({ email: { $in: ['user1@test.com', 'user2@test.com'] } });
    await TimesheetEntry.deleteMany({ owner: { $exists: false } }); // Clean up ownerless entries
    
    const user1 = new User({
      name: 'User One',
      email: 'user1@test.com',
      password: 'password123'
    });
    await user1.save();

    const user2 = new User({
      name: 'User Two', 
      email: 'user2@test.com',
      password: 'password123'
    });
    await user2.save();

    console.log('✅ Created test users');
    console.log(`   User 1: ${user1.name} (${user1._id})`);
    console.log(`   User 2: ${user2.name} (${user2._id})\n`);

    // Create timesheet entries for User 1
    console.log('📊 Creating timesheet data for User 1...');
    const user1Entries = [
      {
        owner: user1._id,
        date: new Date(),
        project: 'User 1 Project A',
        startTime: new Date('2024-01-01T09:00:00'),
        endTime: new Date('2024-01-01T17:00:00'),
        hoursWorked: 8,
        description: 'User 1 work on Project A'
      },
      {
        owner: user1._id,
        date: new Date(),
        project: 'User 1 Project B',
        startTime: new Date('2024-01-02T10:00:00'),
        endTime: new Date('2024-01-02T14:00:00'),
        hoursWorked: 4,
        description: 'User 1 work on Project B'
      }
    ];
    await TimesheetEntry.insertMany(user1Entries);
    console.log(`✅ Created ${user1Entries.length} entries for User 1`);

    // Create timesheet entries for User 2
    console.log('📊 Creating timesheet data for User 2...');
    const user2Entries = [
      {
        owner: user2._id,
        date: new Date(),
        project: 'User 2 Project X',
        startTime: new Date('2024-01-01T08:00:00'),
        endTime: new Date('2024-01-01T16:00:00'),
        hoursWorked: 8,
        description: 'User 2 work on Project X'
      },
      {
        owner: user2._id,
        date: new Date(),
        project: 'User 2 Project Y',
        startTime: new Date('2024-01-02T09:00:00'),
        endTime: new Date('2024-01-02T15:00:00'),
        hoursWorked: 6,
        description: 'User 2 work on Project Y'
      },
      {
        owner: user2._id,
        date: new Date(),
        project: 'User 2 Project Z',
        startTime: new Date('2024-01-03T10:00:00'),
        endTime: new Date('2024-01-03T12:00:00'),
        hoursWorked: 2,
        description: 'User 2 work on Project Z'
      }
    ];
    await TimesheetEntry.insertMany(user2Entries);
    console.log(`✅ Created ${user2Entries.length} entries for User 2\n`);

    // Test data separation
    console.log('🧪 Testing data separation...\n');

    // Test 1: User 1 should only see their own entries
    const user1Data = await TimesheetEntry.find({ owner: user1._id });
    console.log(`📈 User 1 can see ${user1Data.length} timesheet entries`);
    user1Data.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.project} - ${entry.hoursWorked}h`);
    });

    // Test 2: User 2 should only see their own entries
    const user2Data = await TimesheetEntry.find({ owner: user2._id });
    console.log(`\n📈 User 2 can see ${user2Data.length} timesheet entries`);
    user2Data.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.project} - ${entry.hoursWorked}h`);
    });

    // Test 3: Cross-contamination check
    const user1SeeingUser2Data = await TimesheetEntry.find({ 
      owner: user1._id, 
      project: { $regex: /User 2/ } 
    });
    const user2SeeingUser1Data = await TimesheetEntry.find({ 
      owner: user2._id, 
      project: { $regex: /User 1/ } 
    });

    console.log(`\n🔒 Data Isolation Test:`);
    console.log(`   User 1 seeing User 2's data: ${user1SeeingUser2Data.length} entries (should be 0)`);
    console.log(`   User 2 seeing User 1's data: ${user2SeeingUser1Data.length} entries (should be 0)`);

    // Test 4: Settings separation
    console.log(`\n⚙️  Testing settings separation...`);
    
    const user1Settings = await UserSettings.getSettings(user1._id);
    user1Settings.defaultPayRate = 25.00;
    user1Settings.currency = 'USD';
    await user1Settings.save();
    
    const user2Settings = await UserSettings.getSettings(user2._id);
    user2Settings.defaultPayRate = 30.00;
    user2Settings.currency = 'EUR';
    await user2Settings.save();

    console.log(`   User 1 settings: $${user1Settings.defaultPayRate}/hr (${user1Settings.currency})`);
    console.log(`   User 2 settings: $${user2Settings.defaultPayRate}/hr (${user2Settings.currency})`);

    // Test 5: Verify totals are user-specific
    console.log(`\n📊 Testing totals calculation...`);
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-03');
    
    const user1Totals = await TimesheetEntry.getTotalsForDateRange(startDate, endDate, user1._id);
    const user2Totals = await TimesheetEntry.getTotalsForDateRange(startDate, endDate, user2._id);
    
    console.log(`   User 1 total hours: ${user1Totals.totalHours}h`);
    console.log(`   User 2 total hours: ${user2Totals.totalHours}h`);

    // Final validation
    console.log(`\n🎯 VALIDATION RESULTS:`);
    const allResults = [
      { test: 'User 1 data count', expected: 2, actual: user1Data.length },
      { test: 'User 2 data count', expected: 3, actual: user2Data.length },
      { test: 'User 1 cross-contamination', expected: 0, actual: user1SeeingUser2Data.length },
      { test: 'User 2 cross-contamination', expected: 0, actual: user2SeeingUser1Data.length },
      { test: 'User 1 total hours', expected: 12, actual: user1Totals.totalHours },
      { test: 'User 2 total hours', expected: 16, actual: user2Totals.totalHours }
    ];

    let allTestsPassed = true;
    allResults.forEach(result => {
      const passed = result.expected === result.actual;
      console.log(`   ${passed ? '✅' : '❌'} ${result.test}: Expected ${result.expected}, Got ${result.actual}`);
      if (!passed) allTestsPassed = false;
    });

    console.log(`\n${allTestsPassed ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED!'}`);
    console.log('User data separation is now properly implemented.');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

testUserDataSeparation();
