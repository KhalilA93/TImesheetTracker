# 🧪 TimeSheet Tracker API Testing Guide

## 📦 Postman Collection Import

1. **Open Postman**
2. **Click "Import"** in the top left
3. **Select "Upload Files"**
4. **Choose** `TimeSheet_Tracker_API.postman_collection.json`
5. **Click "Import"**

## 🚀 Getting Started

### **Step 1: Start Your Server**
```bash
cd c:/Users/angel/Desktop/TimeSheetTracker/backend
node server.js
```
You should see:
```
Server running on port 5000
✅ MongoDB connected successfully
```

### **Step 2: Set Base URL**
In Postman, the collection already has the base URL set to:
`http://localhost:5000/api`

## 📋 **Recommended Testing Order**

### **🔧 Phase 1: Basic Setup**
1. **Health & Status > Health Check** - Verify server is running
2. **Health & Status > API Documentation** - Get API overview
3. **Settings > Get All Settings** - Initialize default settings

### **📅 Phase 2: Create Data**
4. **Settings > Update Pay Rate** - Set your hourly rate (IMPORTANT: Do this first!)
5. **Timesheet Entries > Create Regular Work Entry** - This saves the timesheet ID automatically
6. **Timesheet Entries > Create Overtime Entry** - Add more test data
7. **Timesheet Entries > Create Meeting Entry** - Different category test

**⚠️ Important Note:** Make sure to set your pay rate BEFORE creating timesheet entries, as the pay calculation depends on having a default rate configured.

### **⏰ Phase 3: Alarms**
8. **Alarms > Create Start Work Reminder** - Uses saved timesheet ID
9. **Alarms > Create End Work Reminder** - Uses saved timesheet ID
10. **Alarms > Create Custom Alarm** - Independent alarm
11. **Alarms > Get All Alarms** - Verify alarms were created

### **📊 Phase 4: Dashboard & Analytics**
12. **Dashboard > Dashboard Overview** - See totals and summaries
13. **Dashboard > Weekly Summary** - Weekly breakdown
14. **Dashboard > Monthly Summary** - Monthly analysis
15. **Timesheet Entries > Get Calendar Entries** - Calendar-formatted data
16. **Timesheet Entries > Get Totals for Date Range** - Aggregated totals

## 🔄 **Auto-Saved Variables**

The collection automatically saves IDs for you:
- **{{timesheetId}}** - Saved when you create a timesheet entry
- **{{alarmId}}** - Saved when you create an alarm

## 📝 **Sample Test Data Included**

### **Timesheet Entries:**
- Regular 8-hour work day
- 3-hour overtime session with rate override
- 1.5-hour team meeting
- Various projects and categories

### **Alarms:**
- Start work reminders (15 min before)
- End work reminders (15 min before end)
- Custom meeting reminders
- Different notification settings

### **Settings:**
- $30/hour default pay rate
- Overtime at 1.5x after 8 hours
- 12-hour time format
- Custom color schemes for categories
- Notification preferences

## 🎯 **Key Features to Test**

### **Calendar Integration:**
- Test `GET /timesheet-entries/calendar` for react-big-calendar data
- Verify date ranges and filtering
- Check color coding by category

### **Pay Calculations:**
- Test automatic pay calculation
- Verify overtime calculations
- Test pay rate overrides

### **Alarm System:**
- Create alarms linked to timesheet entries
- Test trigger/snooze/dismiss functionality
- Verify alarm timing calculations

### **Dashboard Analytics:**
- Test date range summaries
- Verify project breakdowns
- Check productivity insights

## 🔧 **Corrected Sample JSON (Use These Instead)**

### **Create Regular Work Entry:**
```json
{
  "date": "2025-06-10",
  "startTime": "2025-06-10T09:00:00.000Z",
  "endTime": "2025-06-10T17:00:00.000Z",
  "description": "Frontend development - React components and calendar integration",
  "project": "TimeSheet Tracker App",
  "category": "regular",
  "status": "confirmed"
}
```

### **Create Overtime Entry:**
```json
{
  "date": "2025-06-11",
  "startTime": "2025-06-11T18:00:00.000Z",
  "endTime": "2025-06-11T21:00:00.000Z",
  "description": "Emergency bug fixes and deployment",
  "project": "Client Website",
  "category": "overtime",
  "payRateOverride": 45,
  "status": "confirmed"
}
```

### **Create Meeting Entry:**
```json
{
  "date": "2025-06-12",
  "startTime": "2025-06-12T14:00:00.000Z",
  "endTime": "2025-06-12T15:30:00.000Z",
  "description": "Weekly team standup and project planning",
  "project": "Team Management",
  "category": "meeting",
  "status": "confirmed"
}
```

**Note:** `calculatedPay` and `hoursWorked` are automatically calculated by the server, so don't include them in your requests!

## 🛠️ **Troubleshooting**

### **Server Issues:**
```bash
# Kill any process on port 5000
netstat -ano | findstr :5000
taskkill //PID [PID_NUMBER] //F

# Restart server
cd backend
node server.js
```

### **Database Issues:**
- Check your `.env` file has correct MongoDB URI
- Verify MongoDB Atlas connection string
- Check network connectivity

### **Common HTTP Status Codes:**
- **200** - Success (GET requests)
- **201** - Created (POST requests)
- **400** - Bad Request (check your JSON)
- **404** - Not Found (check endpoint URL)
- **500** - Server Error (check server console)

## 📈 **Expected Results**

After running through all tests, you should have:
- ✅ Multiple timesheet entries
- ✅ Several alarms with different types
- ✅ Populated dashboard with totals
- ✅ Calendar-ready event data
- ✅ Analytics and insights

This comprehensive test suite validates all functionality needed for your react-big-calendar integration! 🎉
