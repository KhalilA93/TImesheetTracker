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

const testDashboardRecalculation = async () => {
  try {
    console.log('🧪 Testing dashboard recalculation functionality...\n');
    
    // Get a user to test with
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`👤 Testing with user: ${user.email || user._id}`);
    
    // Get user settings and update pay rate to test recalculation
    const settings = await UserSettings.getSettings(user._id);
    const originalPayRate = settings.defaultPayRate;
    console.log(`💰 Original pay rate: $${originalPayRate}/hour`);
    
    // Temporarily change pay rate to test recalculation
    const newPayRate = originalPayRate + 5;
    settings.defaultPayRate = newPayRate;
    await settings.save();
    console.log(`💰 Updated pay rate: $${newPayRate}/hour`);
    
    // Get some entries before recalculation
    const entriesBefore = await TimesheetEntry.find({ owner: user._id }).limit(3);
    console.log('\n📊 Entries before recalculation:');
    entriesBefore.forEach((entry, index) => {
      console.log(`  Entry ${index + 1}: ${entry.hoursWorked}h × $${entry.payRateOverride || originalPayRate} = $${entry.calculatedPay}`);
    });
    
    // Simulate the dashboard recalculation function
    console.log('\n🔄 Running recalculation...');
    let updatedCount = 0;
    const entries = await TimesheetEntry.find({ owner: user._id });
    
    for (const entry of entries) {
      let payRate = entry.payRateOverride || newPayRate;
      const newCalculatedPay = entry.hoursWorked * payRate;
      
      if (Math.abs(entry.calculatedPay - newCalculatedPay) > 0.01) {
        entry.calculatedPay = newCalculatedPay;
        await entry.save();
        updatedCount++;
      }
    }
    
    console.log(`✅ Recalculation completed: ${updatedCount} entries updated`);
    
    // Get entries after recalculation
    const entriesAfter = await TimesheetEntry.find({ owner: user._id }).limit(3);
    console.log('\n📊 Entries after recalculation:');
    entriesAfter.forEach((entry, index) => {
      console.log(`  Entry ${index + 1}: ${entry.hoursWorked}h × $${entry.payRateOverride || newPayRate} = $${entry.calculatedPay}`);
    });
    
    // Restore original pay rate
    settings.defaultPayRate = originalPayRate;
    await settings.save();
    console.log(`\n🔄 Restored original pay rate: $${originalPayRate}/hour`);
    
    console.log('\n✅ Dashboard recalculation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during dashboard recalculation test:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test
const main = async () => {
  await connectDB();
  await testDashboardRecalculation();
};

main().catch(console.error);
