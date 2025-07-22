#!/usr/bin/env node

// Test script to verify calendar endpoint functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

async function testCalendarEndpoint() {
  try {
    console.log('🧪 Testing Calendar Endpoint Functionality');
    console.log('==========================================');
    
    // 1. Login to get auth token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // 2. Set up authenticated headers
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 3. Test calendar endpoint with date range
    console.log('2. Testing calendar endpoint...');
    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);   // 7 days from now
    
    const calendarResponse = await axios.get(`${BASE_URL}/timesheet-entries/calendar`, {
      headers,
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    
    console.log('✅ Calendar endpoint responded successfully');
    console.log(`📅 Found ${calendarResponse.data.events.length} calendar events`);
    
    // 4. Validate event structure
    const events = calendarResponse.data.events;
    if (events.length > 0) {
      console.log('3. Validating event structure...');
      const sampleEvent = events[0];
      
      const requiredFields = ['id', 'title', 'start', 'end', 'hoursWorked', 'calculatedPay'];
      const missingFields = requiredFields.filter(field => !(field in sampleEvent));
      
      if (missingFields.length === 0) {
        console.log('✅ Event structure is valid');
        console.log(`   Sample event: ${sampleEvent.title} - ${sampleEvent.hoursWorked}h - $${sampleEvent.calculatedPay}`);
      } else {
        console.log(`❌ Missing fields in event: ${missingFields.join(', ')}`);
      }
      
      // Check if dates are properly formatted
      const startDate = new Date(sampleEvent.start);
      const endDate = new Date(sampleEvent.end);
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        console.log('✅ Event dates are valid');
      } else {
        console.log('❌ Event dates are invalid');
      }
    } else {
      console.log('⚠️  No events found in date range');
      
      // 5. Create a test entry
      console.log('4. Creating test entry...');
      const testEntry = {
        date: now.toISOString().split('T')[0],
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        endTime: now.toISOString(),
        description: 'Test calendar entry',
        project: 'Calendar Testing',
        category: 'regular',
        status: 'confirmed'
      };
      
      const createResponse = await axios.post(`${BASE_URL}/timesheet-entries`, testEntry, { headers });
      console.log('✅ Test entry created successfully');
      
      // 6. Re-test calendar endpoint
      console.log('5. Re-testing calendar endpoint...');
      const newCalendarResponse = await axios.get(`${BASE_URL}/timesheet-entries/calendar`, {
        headers,
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      console.log(`📅 Now found ${newCalendarResponse.data.events.length} calendar events`);
      if (newCalendarResponse.data.events.length > 0) {
        const newEvent = newCalendarResponse.data.events[0];
        console.log(`   New event: ${newEvent.title} - ${newEvent.hoursWorked}h - $${newEvent.calculatedPay}`);
      }
    }
    
    console.log('');
    console.log('🎉 Calendar endpoint test completed successfully!');
    
  } catch (error) {
    console.error('❌ Calendar endpoint test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testCalendarEndpoint();
}

module.exports = { testCalendarEndpoint };
