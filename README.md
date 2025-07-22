# TimeSheet Tracker

A full-stack web application for tracking work hours with JWT authentication and user-specific data management.

## Features

- **User Authentication**: JWT-based login/registration system
- **Time Tracking**: Create, edit, and manage timesheet entries
- **Calendar View**: Visual calendar display of work entries
- **Dashboard**: Overview of daily, weekly, and monthly statistics
- **Settings Management**: User-specific preferences and pay rates
- **Alarms System**: Reminders and notifications

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React with Redux
- React Big Calendar
- React Router
- Axios for API calls

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Set up environment variables in `backend/.env`
5. Start MongoDB
6. Run development servers:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Timesheet Entries
- `GET /api/timesheet-entries` - Get user's entries
- `POST /api/timesheet-entries` - Create new entry
- `GET /api/timesheet-entries/calendar` - Get calendar formatted entries

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard statistics

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## License

This project is licensed under the MIT License.
