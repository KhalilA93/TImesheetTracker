const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timesheet-tracker');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const { TimesheetEntry, UserSettings, User } = require('../models');

const testDashboardCalculations = async () => {
  try {
    console.log('🧪 Testing dashboard calculations...\n');
    
    // Get a user to test with
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`👤 Testing with user: ${user.email || user._id}`);
    
    // Get user settings
    const settings = await UserSettings.getSettings(user._id);
    console.log(`💰 User pay rate: $${settings.defaultPayRate}/hour`);
    
    // Get some timesheet entries for this user
    const entries = await TimesheetEntry.find({ owner: user._id }).limit(5);
    console.log(`📊 Found ${entries.length} timesheet entries for this user\n`);
    
    // Display entry details
    entries.forEach((entry, index) => {
      console.log(`Entry ${index + 1}:`);
      console.log(`  Hours: ${entry.hoursWorked}`);
      console.log(`  Pay Rate: $${entry.payRateOverride || settings.defaultPayRate}/hour`);
      console.log(`  Calculated Pay: $${entry.calculatedPay}`);
      console.log(`  Expected Pay: $${entry.hoursWorked * (entry.payRateOverride || settings.defaultPayRate)}`);
      console.log(`  Category: ${entry.category}`);
      console.log(`  Status: ${entry.status}\n`);
    });
    
    // Test date range calculations
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const thisWeekStart = new Date(todayStart);
    thisWeekStart.setDate(todayStart.getDate() - todayStart.getDay());
    
    console.log('📅 Date ranges:');
    console.log(`  Today: ${todayStart.toDateString()}`);
    console.log(`  Week start: ${thisWeekStart.toDateString()}\n`);
    
    // Test getTotalsForDateRange
    const todayTotals = await TimesheetEntry.getTotalsForDateRange(todayStart, today, user._id);
    const weekTotals = await TimesheetEntry.getTotalsForDateRange(thisWeekStart, today, user._id);
    
    console.log('📊 Dashboard totals:');
    console.log(`  Today: ${todayTotals.totalHours} hours, $${todayTotals.totalPay}`);
    console.log(`  This week: ${weekTotals.totalHours} hours, $${weekTotals.totalPay}`);
    console.log(`  Entry counts - Today: ${todayTotals.entryCount}, Week: ${weekTotals.entryCount}\n`);
    
    console.log('✅ Dashboard calculation test completed');
    
  } catch (error) {
    console.error('❌ Error during dashboard calculation test:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test
const main = async () => {
  await connectDB();
  await testDashboardCalculations();
};

main().catch(console.error);
