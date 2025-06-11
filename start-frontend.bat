@echo off
echo Starting TimeSheet Tracker Frontend...
echo.
echo Make sure the backend is running on http://localhost:5000
echo.
cd /d "c:\Users\angel\Desktop\TimeSheetTracker\frontend"
echo Installing dependencies...
call npm install
echo.
echo Starting development server...
echo Frontend will be available at http://localhost:3000
echo.
call npm start
