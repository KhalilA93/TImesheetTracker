#!/bin/bash

# API Testing Script for TimeSheet Tracker
BASE_URL="http://localhost:5000/api"

echo "🧪 Testing TimeSheet Tracker API Endpoints"
echo "==========================================="

# Test 1: Health Check
echo ""
echo "1. Testing Health Check..."
curl -s -X GET "$BASE_URL/health" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/health"

# Test 2: API Documentation
echo ""
echo "2. Testing API Documentation..."
curl -s -X GET "$BASE_URL" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL"

# Test 3: Settings - Get default settings
echo ""
echo "3. Testing Settings - GET..."
curl -s -X GET "$BASE_URL/settings" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/settings"

# Test 4: Settings - Update pay rate
echo ""
echo "4. Testing Settings - Update Pay Rate..."
curl -s -X PUT "$BASE_URL/settings/pay-rate" \
  -H "Content-Type: application/json" \
  -d '{"payRate": 30}' | jq '.' 2>/dev/null || curl -s -X PUT "$BASE_URL/settings/pay-rate" \
  -H "Content-Type: application/json" \
  -d '{"payRate": 30}'

# Test 5: Create Timesheet Entry
echo ""
echo "5. Testing Timesheet Entry - CREATE..."
TIMESHEET_RESPONSE=$(curl -s -X POST "$BASE_URL/timesheet-entries" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-06-10",
    "startTime": "2025-06-10T09:00:00.000Z",
    "endTime": "2025-06-10T17:00:00.000Z",
    "description": "Frontend development - React components",
    "project": "TimeSheet Tracker App",
    "category": "regular",
    "status": "confirmed"
  }')

echo "$TIMESHEET_RESPONSE" | jq '.' 2>/dev/null || echo "$TIMESHEET_RESPONSE"

# Extract timesheet ID for alarm creation
TIMESHEET_ID=$(echo "$TIMESHEET_RESPONSE" | jq -r '.entry._id' 2>/dev/null || echo "$TIMESHEET_RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)

# Test 6: Get all timesheet entries
echo ""
echo "6. Testing Timesheet Entries - GET ALL..."
curl -s -X GET "$BASE_URL/timesheet-entries" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/timesheet-entries"

# Test 7: Get calendar entries
echo ""
echo "7. Testing Calendar Entries..."
curl -s -X GET "$BASE_URL/timesheet-entries/calendar?startDate=2025-06-01&endDate=2025-06-30" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/timesheet-entries/calendar?startDate=2025-06-01&endDate=2025-06-30"

# Test 8: Create Alarm (if we have a timesheet ID)
echo ""
echo "8. Testing Alarm Creation..."
if [ "$TIMESHEET_ID" != "" ] && [ "$TIMESHEET_ID" != "null" ]; then
  curl -s -X POST "$BASE_URL/alarms" \
    -H "Content-Type: application/json" \
    -d "{
      \"timesheetEntryId\": \"$TIMESHEET_ID\",
      \"type\": \"start-reminder\",
      \"reminderMinutes\": 15,
      \"title\": \"Work Start Reminder\",
      \"message\": \"Time to start work in 15 minutes!\",
      \"soundEnabled\": true,
      \"browserNotification\": true
    }" | jq '.' 2>/dev/null || curl -s -X POST "$BASE_URL/alarms" \
    -H "Content-Type: application/json" \
    -d "{
      \"timesheetEntryId\": \"$TIMESHEET_ID\",
      \"type\": \"start-reminder\",
      \"reminderMinutes\": 15,
      \"title\": \"Work Start Reminder\",
      \"message\": \"Time to start work in 15 minutes!\",
      \"soundEnabled\": true,
      \"browserNotification\": true
    }"
else
  echo "No timesheet ID available for alarm creation"
fi

# Test 9: Get all alarms
echo ""
echo "9. Testing Alarms - GET ALL..."
curl -s -X GET "$BASE_URL/alarms" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/alarms"

# Test 10: Dashboard overview
echo ""
echo "10. Testing Dashboard Overview..."
curl -s -X GET "$BASE_URL/dashboard" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/dashboard"

# Test 11: Get totals
echo ""
echo "11. Testing Totals..."
curl -s -X GET "$BASE_URL/timesheet-entries/totals?startDate=2025-06-01&endDate=2025-06-30" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/timesheet-entries/totals?startDate=2025-06-01&endDate=2025-06-30"

echo ""
echo "🎉 API Testing Complete!"
