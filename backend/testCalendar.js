const { TimesheetEntry, UserSettings } = require('./models');
const mongoose = require('mongoose');

// Simple test to verify calendar functionality
async function testCalendarFunctionality() {
  try {
    console.log('🗓️  Testing Calendar Functionality');
    console.log('================================');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timesheet');
    console.log('✅ Connected to database');
    
    // Get all users to test with
    const users = await UserSettings.find({}).limit(1);
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    const userId = users[0].userId;
    console.log(`👤 Testing with user: ${userId}`);
    
    // Get user settings
    const settings = await UserSettings.getSettings(userId);
    console.log(`💰 User pay rate: $${settings.defaultPayRate}/hour`);
    
    // Check if user has timesheet entries
    const entryCount = await TimesheetEntry.countDocuments({ owner: userId });
    console.log(`📝 User has ${entryCount} timesheet entries`);
    
    if (entryCount === 0) {
      console.log('⚠️  No entries found, creating test entry...');
      
      const testEntry = new TimesheetEntry({
        owner: userId,
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
        description: 'Test calendar entry',
        project: 'Calendar Test',
        category: 'regular',
        status: 'confirmed'
      });
      
      await testEntry.save();
      console.log('✅ Created test entry');
    }
    
    // Test calendar endpoint format
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last week
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Next week
    
    const entries = await TimesheetEntry.find({
      owner: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    console.log(`📅 Found ${entries.length} entries in date range`);
    
    // Transform entries like the calendar endpoint does
    const calendarEvents = entries.map(entry => ({
      id: entry._id.toString(),
      title: entry.project || entry.description || 'Work Entry',
      start: entry.startTime,
      end: entry.endTime,
      allDay: false,
      hoursWorked: entry.hoursWorked,
      calculatedPay: entry.calculatedPay,
      project: entry.project,
      category: entry.category,
      description: entry.description,
      status: entry.status,
      payRateOverride: entry.payRateOverride,
      color: entry.category || 'regular'
    }));
    
    console.log('\n📊 Calendar Events Summary:');
    calendarEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.title}`);
      console.log(`     Hours: ${event.hoursWorked}h | Pay: $${event.calculatedPay || 0}`);
      console.log(`     Category: ${event.category} | Status: ${event.status}`);
      console.log(`     Start: ${new Date(event.start).toLocaleString()}`);
      console.log(`     End: ${new Date(event.end).toLocaleString()}`);
      console.log('');
    });
    
    console.log('✅ Calendar functionality test completed successfully!');
    
  } catch (error) {
    console.error('❌ Calendar test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  testCalendarFunctionality();
}

module.exports = { testCalendarFunctionality };
