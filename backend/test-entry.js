const mongoose = require('mongoose');
const { TimesheetEntry, User } = require('./models');

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/TimesheetTracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createTestEntry() {
  try {
    // Find a user to test with
    const user = await User.findOne();
    if (!user) {
      console.log('No users found. Please create a user first.');
      return;
    }

    console.log('Found user:', user.email);

    // Create a test entry for today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startTime = new Date(today);
    startTime.setHours(9, 0, 0, 0); // 9:00 AM
    const endTime = new Date(today);
    endTime.setHours(17, 0, 0, 0); // 5:00 PM

    const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);

    const testEntry = new TimesheetEntry({
      owner: user._id,
      date: today,
      startTime: startTime,
      endTime: endTime,
      hoursWorked: hoursWorked,
      description: 'Test work entry for calendar display',
      project: 'Test Project',
      category: 'Development',
      status: 'confirmed'
    });

    const savedEntry = await testEntry.save();
    console.log('Created test entry:', {
      id: savedEntry._id,
      date: savedEntry.date,
      project: savedEntry.project,
      hoursWorked: savedEntry.hoursWorked
    });

    // Check if entries can be found
    const entries = await TimesheetEntry.find({ owner: user._id });
    console.log(`Found ${entries.length} total entries for user`);

    const todayEntries = await TimesheetEntry.find({
      owner: user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    console.log(`Found ${todayEntries.length} entries for today`);

  } catch (error) {
    console.error('Error creating test entry:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestEntry();
