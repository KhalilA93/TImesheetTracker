const mongoose = require('mongoose');
const { TimesheetEntry, UserSettings } = require('./models');
require('dotenv').config();

const createTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/timesheet_tracker');
    console.log('Connected to MongoDB');

    // Create or update settings with default pay rate
    const settings = await UserSettings.findOneAndUpdate(
      {},
      {
        defaultPayRate: 30,
        overtimeRate: 45,
        overtimeThreshold: 8,
        timeFormat: '12-hour',
        colorScheme: {
          regular: '#3174ad',
          overtime: '#dc3545',
          meeting: '#28a745',
          training: '#ffc107',
          vacation: '#17a2b8',
          sick: '#6c757d',
          holiday: '#e83e8c'
        },
        notifications: {
          enabled: true,
          beforeShift: 15,
          beforeBreak: 5,
          endOfShift: 15
        }
      },
      { upsert: true, new: true }
    );
    console.log('Settings created:', settings);

    // Clear existing entries
    await TimesheetEntry.deleteMany({});
    console.log('Cleared existing timesheet entries');

    // Create test timesheet entries
    const testEntries = [
      {
        date: new Date('2025-06-10'),
        startTime: new Date('2025-06-10T09:00:00.000Z'),
        endTime: new Date('2025-06-10T17:00:00.000Z'),
        description: 'Frontend development - React components and calendar integration',
        project: 'TimeSheet Tracker App',
        category: 'regular',
        status: 'confirmed',
        color: '#3174ad'
      },
      {
        date: new Date('2025-06-11'),
        startTime: new Date('2025-06-11T09:00:00.000Z'),
        endTime: new Date('2025-06-11T12:00:00.000Z'),
        description: 'Team meeting and project planning',
        project: 'TimeSheet Tracker App',
        category: 'meeting',
        status: 'confirmed',
        color: '#28a745'
      },
      {
        date: new Date('2025-06-11'),
        startTime: new Date('2025-06-11T18:00:00.000Z'),
        endTime: new Date('2025-06-11T21:00:00.000Z'),
        description: 'Emergency bug fixes and deployment',
        project: 'Client Website',
        category: 'overtime',
        payRateOverride: 45,
        status: 'confirmed',
        color: '#dc3545'
      },
      {
        date: new Date('2025-06-12'),
        startTime: new Date('2025-06-12T10:00:00.000Z'),
        endTime: new Date('2025-06-12T16:00:00.000Z'),
        description: 'Backend API development',
        project: 'TimeSheet Tracker App',
        category: 'regular',
        status: 'confirmed',
        color: '#3174ad'
      }
    ];

    // Save each entry
    for (const entryData of testEntries) {
      const entry = new TimesheetEntry(entryData);
      await entry.save();
      console.log(`Created entry: ${entry.description} (${entry.hoursWorked}h - $${entry.calculatedPay})`);
    }

    console.log('\n✅ Test data created successfully!');
    console.log('You can now test the calendar with real data.');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestData();
