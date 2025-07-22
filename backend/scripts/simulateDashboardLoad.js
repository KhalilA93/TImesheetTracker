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

// Copy the recalculation function from dashboard controller
const recalculateUserEarnings = async (userId) => {
  try {
    // Get user settings for pay rate
    const settings = await UserSettings.getSettings(userId);
    
    // Find all timesheet entries for this user that might need recalculation
    const entries = await TimesheetEntry.find({ 
      owner: userId,
      $or: [
        { payRateOverride: { $exists: false } },
        { payRateOverride: null },
        { payRateOverride: 0 }
      ]
    });
    
    let updatedCount = 0;
    
    for (const entry of entries) {
      let payRate = entry.payRateOverride || settings.defaultPayRate;
      const newCalculatedPay = Number((entry.hoursWorked * payRate).toFixed(2));
      
      // Update only if the value has changed (avoid unnecessary saves)
      if (Math.abs(entry.calculatedPay - newCalculatedPay) > 0.01) {
        console.log(`🔄 Updating entry: ${entry.hoursWorked}h × $${payRate} = $${newCalculatedPay} (was $${entry.calculatedPay})`);
        entry.calculatedPay = newCalculatedPay;
        await entry.save();
        updatedCount++;
      }
    }
    
    return updatedCount;
  } catch (error) {
    console.error('Error recalculating user earnings:', error);
    return 0;
  }
};

const testDashboardRecalculation = async () => {
  try {
    console.log('🧪 Testing dashboard recalculation (simulating dashboard load)...\n');
    
    // Get a user to test with
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`👤 Testing with user: ${user.email || user._id}`);
    
    // Show entries before recalculation
    const entriesBefore = await TimesheetEntry.find({ owner: user._id }).limit(3);
    console.log('\n📊 Entries before dashboard recalculation:');
    entriesBefore.forEach((entry, index) => {
      console.log(`  Entry ${index + 1}: ${entry.hoursWorked}h = $${entry.calculatedPay}`);
    });
    
    console.log('\n🔄 Running dashboard recalculation...');
    const updatedCount = await recalculateUserEarnings(user._id);
    console.log(`✅ Dashboard recalculation completed: ${updatedCount} entries updated`);
    
    // Show entries after recalculation
    const entriesAfter = await TimesheetEntry.find({ owner: user._id }).limit(3);
    console.log('\n📊 Entries after dashboard recalculation:');
    entriesAfter.forEach((entry, index) => {
      console.log(`  Entry ${index + 1}: ${entry.hoursWorked}h = $${entry.calculatedPay}`);
    });
    
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
