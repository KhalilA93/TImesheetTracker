const mongoose = require('mongoose');
const { TimesheetEntry, User } = require('./models');

async function createTestEntry() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/timesheet-tracker');
    console.log('Connected to MongoDB');

    // Find a user to create an entry for
    const user = await User.findOne();
    if (!user) {
      console.log('No users found. Please create a user first.');
      return;
    }

    console.log(`Creating test entry for user: ${user.email}`);

    // Create a test entry for today
    const today = new Date();
    const startTime = new Date(today);
    startTime.setHours(9, 0, 0, 0); // 9:00 AM

    const endTime = new Date(today);
    endTime.setHours(17, 0, 0, 0); // 5:00 PM

    const hoursWorked = (endTime - startTime) / (1000 * 60 * 60); // 8 hours

    const testEntry = new TimesheetEntry({
      owner: user._id,
      date: today,
      startTime: startTime,
      endTime: endTime,
      hoursWorked: hoursWorked,
      description: 'Test entry for calendar and dashboard verification',
      project: 'Test Project',
      category: 'Development',
      status: 'confirmed',
      title: 'Test Work Session'
    });

    await testEntry.save();
    console.log('Test entry created successfully:', {
      id: testEntry._id,
      date: testEntry.date,
      hours: testEntry.hoursWorked,
      project: testEntry.project
    });

    // Create another entry for yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(10, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(16, 30, 0, 0);
    
    const yesterdayHours = (yesterdayEnd - yesterdayStart) / (1000 * 60 * 60);

    const yesterdayEntry = new TimesheetEntry({
      owner: user._id,
      date: yesterday,
      startTime: yesterdayStart,
      endTime: yesterdayEnd,
      hoursWorked: yesterdayHours,
      description: 'Yesterday test entry',
      project: 'Another Project',
      category: 'Testing',
      status: 'confirmed',
      title: 'Yesterday Work Session'
    });

    await yesterdayEntry.save();
    console.log('Yesterday entry created successfully:', {
      id: yesterdayEntry._id,
      date: yesterdayEntry.date,
      hours: yesterdayEntry.hoursWorked,
      project: yesterdayEntry.project
    });

  } catch (error) {
    console.error('Error creating test entry:', error);
  } finally {
    mongoose.disconnect();
  }
}

createTestEntry();
