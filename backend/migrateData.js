const mongoose = require('mongoose');
const TimesheetEntry = require('./models/TimesheetEntry');
const UserSettings = require('./models/UserSettings');
const Alarm = require('./models/Alarm');
const User = require('./models/User');
require('dotenv').config();

const migrateExistingData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timesheet-tracker');
    console.log('✅ Connected to MongoDB\n');

    // Get the test user to assign orphaned data to
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('❌ Test user not found. Please create a test user first.');
      process.exit(1);
    }

    console.log(`📋 Migration Target: ${testUser.name} (${testUser._id})\n`);

    // 1. Migrate TimesheetEntry documents without owner
    console.log('🔧 Migrating TimesheetEntry documents...');
    const orphanedEntries = await TimesheetEntry.find({ owner: { $exists: false } });
    if (orphanedEntries.length > 0) {
      const result = await TimesheetEntry.updateMany(
        { owner: { $exists: false } },
        { $set: { owner: testUser._id } }
      );
      console.log(`✅ Updated ${result.modifiedCount} TimesheetEntry documents`);
    } else {
      console.log('✅ No orphaned TimesheetEntry documents found');
    }

    // 2. Migrate UserSettings documents without user reference
    console.log('\n🔧 Migrating UserSettings documents...');
    const orphanedSettings = await UserSettings.find({ user: { $exists: false } });
    if (orphanedSettings.length > 0) {
      // For settings, we'll update the first one and delete the rest
      if (orphanedSettings.length >= 1) {
        await UserSettings.updateOne(
          { _id: orphanedSettings[0]._id },
          { $set: { user: testUser._id } }
        );
        console.log(`✅ Updated 1 UserSettings document for test user`);
        
        if (orphanedSettings.length > 1) {
          await UserSettings.deleteMany({ 
            _id: { $in: orphanedSettings.slice(1).map(s => s._id) } 
          });
          console.log(`✅ Removed ${orphanedSettings.length - 1} duplicate UserSettings documents`);
        }
      }
    } else {
      console.log('✅ No orphaned UserSettings documents found');
    }

    // 3. Migrate Alarm documents without owner
    console.log('\n🔧 Migrating Alarm documents...');
    const orphanedAlarms = await Alarm.find({ owner: { $exists: false } });
    if (orphanedAlarms.length > 0) {
      const result = await Alarm.updateMany(
        { owner: { $exists: false } },
        { $set: { owner: testUser._id } }
      );
      console.log(`✅ Updated ${result.modifiedCount} Alarm documents`);
    } else {
      console.log('✅ No orphaned Alarm documents found');
    }

    // 4. Verify data integrity
    console.log('\n🔍 Verifying data integrity...');
    
    const entryCount = await TimesheetEntry.countDocuments({ owner: testUser._id });
    const settingsCount = await UserSettings.countDocuments({ user: testUser._id });
    const alarmCount = await Alarm.countDocuments({ owner: testUser._id });
    
    console.log(`📊 Test user (${testUser.email}) now has:`);
    console.log(`   • ${entryCount} timesheet entries`);
    console.log(`   • ${settingsCount} settings document(s)`);
    console.log(`   • ${alarmCount} alarms`);

    // 5. Check for any remaining orphaned data
    console.log('\n🔍 Checking for remaining orphaned data...');
    
    const remainingOrphanedEntries = await TimesheetEntry.countDocuments({ owner: { $exists: false } });
    const remainingOrphanedSettings = await UserSettings.countDocuments({ user: { $exists: false } });
    const remainingOrphanedAlarms = await Alarm.countDocuments({ owner: { $exists: false } });
    
    console.log(`Remaining orphaned data:`);
    console.log(`   • TimesheetEntries: ${remainingOrphanedEntries}`);
    console.log(`   • UserSettings: ${remainingOrphanedSettings}`);
    console.log(`   • Alarms: ${remainingOrphanedAlarms}`);

    if (remainingOrphanedEntries === 0 && remainingOrphanedSettings === 0 && remainingOrphanedAlarms === 0) {
      console.log('\n🎉 Migration completed successfully! All data is now properly associated with users.');
    } else {
      console.log('\n⚠️  Some orphaned data still exists. Manual intervention may be required.');
    }

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

migrateExistingData();
