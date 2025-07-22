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

// Require models after connection
const { TimesheetEntry, UserSettings } = require('../models');

const recalculatePayments = async () => {
  try {
    console.log('🔄 Starting payment recalculation...');
    
    // Get all timesheet entries
    const entries = await TimesheetEntry.find({});
    console.log(`📊 Found ${entries.length} timesheet entries to process`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const entry of entries) {
      try {
        let payRate = entry.payRateOverride;
        
        // If no override, get user-specific pay rate
        if (!payRate) {
          if (entry.owner) {
            const settings = await UserSettings.getSettings(entry.owner);
            payRate = settings.defaultPayRate || 15.00;
          } else {
            payRate = 15.00; // Default fallback
          }
        }
        
        // Calculate new pay (simple hourly rate, no overtime)
        const newCalculatedPay = entry.hoursWorked * payRate;
        
        // Update only if the value has changed
        if (entry.calculatedPay !== newCalculatedPay) {
          entry.calculatedPay = newCalculatedPay;
          await entry.save();
          updatedCount++;
          
          if (updatedCount % 10 === 0) {
            console.log(`✅ Updated ${updatedCount} entries so far...`);
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing entry ${entry._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Payment recalculation completed!`);
    console.log(`✅ Updated: ${updatedCount} entries`);
    console.log(`⚠️  Errors: ${errorCount} entries`);
    console.log(`📊 Total processed: ${entries.length} entries`);
    
  } catch (error) {
    console.error('❌ Error during payment recalculation:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the migration
const main = async () => {
  await connectDB();
  await recalculatePayments();
};

main().catch(console.error);
