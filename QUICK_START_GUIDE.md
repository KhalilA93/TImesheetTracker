# 🚀 TimeSheet Tracker - Quick Start Guide

## ✅ Prerequisites Checklist

Before starting, ensure you have:
- ✅ Backend server running on `http://localhost:5000`
- ✅ MongoDB Atlas connection configured
- ✅ Node.js installed (version 14+)
- ✅ All dependencies installed

## 🏃‍♂️ Quick Start (5 Minutes)

### **Option 1: Automated Startup (Recommended)**

```bash
# Start both servers automatically
./dev-start.sh
```

### **Option 2: Manual Startup**

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```
Expected output:
```
Server running on port 5000
✅ MongoDB connected successfully
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Expected output:
```
webpack compiled with 0 errors
Local: http://localhost:3000
```

### **Option 3: Windows Batch Script**
```bash
# Double-click or run:
start-frontend.bat
```

## 🌐 Application URLs

- **Frontend App**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

## 🎯 First Steps After Startup

### 1. **Configure Settings (IMPORTANT)**
- Navigate to: http://localhost:3000/settings
- Set your default pay rate (e.g., $30/hour)
- Configure overtime settings
- Customize category colors

### 2. **Create Your First Timesheet Entry**
- Go to Calendar view
- Click on an empty time slot
- Fill in work details
- Save the entry

### 3. **Set Up Work Alarms**
- Navigate to Alarms section
- Create start/end work reminders
- Test alarm functionality

### 4. **Monitor Dashboard**
- Check daily/weekly/monthly summaries
- View earnings calculations
- Track productivity metrics

## 🔧 Troubleshooting

### **Frontend Won't Start**
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### **Backend Connection Issues**
- Verify backend is running on port 5000
- Check `.env` file in backend directory
- Ensure MongoDB Atlas is accessible

### **Calendar Not Loading**
- Check browser console for errors
- Verify API responses at http://localhost:5000/api/timesheet-entries/calendar
- Clear browser cache

### **Build Errors**
```bash
# Run build to see detailed errors
cd frontend
npm run build
```

## 📱 Mobile Access

The application is responsive and works on mobile devices:
- **Desktop**: Full calendar interface
- **Tablet**: Optimized layout
- **Mobile**: Touch-friendly interface

## 🧪 Testing the Application

### **API Testing (Backend)**
1. Import Postman collection: `TimeSheet_Tracker_API_FIXED.postman_collection.json`
2. Follow the API Testing Guide
3. Test all endpoints

### **Frontend Testing**
1. Open http://localhost:3000
2. Test all navigation links
3. Create/edit/delete timesheet entries
4. Verify alarm functionality
5. Check dashboard analytics

## 🔐 Security Notes

- Backend runs on localhost only
- No authentication implemented (development setup)
- Environment variables stored in `.env` files
- API keys secured in backend configuration

## 📊 Data Structure

Your application manages:
- **Timesheet Entries**: Work sessions with automatic pay calculation
- **Alarms**: Work reminders and notifications
- **Settings**: User preferences and pay rates
- **Dashboard Data**: Analytics and summaries

## 🎉 You're All Set!

Your TimeSheet Tracker is now ready for use! The application provides:

✅ **Calendar-based timesheet management**
✅ **Automatic pay calculations with overtime**
✅ **Work reminder alarms**
✅ **Real-time analytics dashboard**
✅ **Responsive design for all devices**
✅ **Professional UI/UX**

## 📚 Additional Resources

- **Frontend Documentation**: `frontend/FRONTEND_README.md`
- **API Testing Guide**: `API_Testing_Guide.md`
- **Project Overview**: `PROJECT_COMPLETION.md`
- **Development Guide**: `DEVELOPMENT_GUIDE.md`

---

**Need Help?** Check the troubleshooting section or review the detailed documentation files.
