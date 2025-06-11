# 🕒 TimeSheet Tracker Frontend

A modern React application for calendar-based timesheet management with react-big-calendar integration.

## 🌟 Features

### 📅 Calendar Interface
- **Interactive Calendar**: Week, month, and day views with react-big-calendar
- **Drag & Drop**: Create timesheet entries by selecting time slots
- **Color Coding**: Different colors for work categories (regular, overtime, meetings, etc.)
- **Real-time Updates**: Live sync with backend API

### ⏰ Timesheet Management
- **CRUD Operations**: Create, read, update, delete timesheet entries
- **Automatic Calculations**: Hours and pay calculated automatically
- **Pay Rate Overrides**: Custom hourly rates for specific entries
- **Multiple Categories**: Regular, overtime, holiday, sick, vacation, training, meeting

### 🔔 Alarm System
- **Work Reminders**: Set alarms for work start/end times
- **Meeting Alerts**: Custom notifications for meetings and events
- **Snooze/Dismiss**: Manage alarm notifications
- **Linked Entries**: Connect alarms to specific timesheet entries

### 📊 Analytics Dashboard
- **Real-time Stats**: Today, weekly, and monthly summaries
- **Pay Tracking**: Earnings calculations with overtime support
- **Project Breakdown**: Time allocation by project
- **Visual Charts**: Upcoming feature for data visualization

### ⚙️ Settings Management
- **Pay Configuration**: Default rates and overtime rules
- **Color Customization**: Personalize category colors
- **Notification Preferences**: Control alarm and reminder settings
- **Time Format**: 12-hour or 24-hour display options

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- Backend server running on `http://localhost:5000`

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd TimeSheetTracker/frontend

# Install dependencies
npm install

# Set up environment variables
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── Calendar/           # Calendar views and timesheet management
│   │   ├── CalendarView.js     # Main calendar component
│   │   ├── TimesheetModal.js   # Entry creation/editing modal
│   │   └── *.css              # Component styles
│   ├── Dashboard/          # Analytics and overview
│   │   ├── Dashboard.js        # Main dashboard
│   │   ├── StatCard.js        # Metric display cards
│   │   └── *.js               # Chart components
│   ├── Alarms/             # Notification management
│   │   ├── Alarms.js          # Alarm list view
│   │   ├── AlarmCard.js       # Individual alarm display
│   │   └── AlarmModal.js      # Alarm creation form
│   ├── Settings/           # Configuration interface
│   │   └── Settings.js        # Settings form
│   └── Navigation/         # App navigation
│       └── Navbar.js          # Main navigation bar
├── services/               # API integration
│   ├── api.js                 # Axios configuration
│   └── apiService.js          # API endpoint functions
├── store/                  # Redux state management
│   ├── store.js               # Store configuration
│   ├── actions/               # Action creators
│   └── reducers/              # State reducers
└── App.js                  # Main application component
```

### State Management
- **Redux**: Global state management
- **Redux Thunk**: Async action handling
- **Modular Reducers**: Separate state slices for timesheet, alarms, settings, dashboard

### API Integration
- **Axios**: HTTP client with interceptors
- **Error Handling**: Comprehensive error management
- **Loading States**: UI feedback for async operations

## 🎨 Styling

### Design System
- **Modern UI**: Clean, professional interface
- **Responsive Design**: Mobile-first approach
- **Color Palette**: Customizable category colors
- **Animations**: Smooth transitions and hover effects

### CSS Architecture
- **Component-scoped CSS**: Each component has its own stylesheet
- **Utility Classes**: Global utility classes for common styles
- **CSS Variables**: For theming and consistency
- **Media Queries**: Responsive breakpoints for mobile/tablet/desktop

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

### Mobile Features
- **Touch-friendly**: Large tap targets for mobile interaction
- **Optimized Calendar**: Mobile-specific calendar view adjustments
- **Responsive Navigation**: Collapsible navigation for smaller screens
- **Modal Optimization**: Full-screen modals on mobile devices

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Development Settings
GENERATE_SOURCEMAP=false  # Disable source maps for production
```

### Default Settings
- **Pay Rate**: $30/hour
- **Overtime Threshold**: 8 hours
- **Overtime Multiplier**: 1.5x
- **Time Format**: 12-hour (AM/PM)

## 🧪 Testing

### Running Tests
```bash
# Run test suite
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Structure
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user workflow testing (planned)

## 📦 Build & Deployment

### Development Build
```bash
npm start
```

### Production Build
```bash
# Create optimized build
npm run build

# Serve build locally
npx serve -s build
```

### Deployment Options
- **Netlify**: Frontend deployment with CI/CD
- **Vercel**: Easy deployment for React apps
- **GitHub Pages**: Static site hosting
- **Custom Server**: Deploy to your own infrastructure

## 🔍 Troubleshooting

### Common Issues

#### API Connection Failed
- Verify backend server is running on port 5000
- Check `REACT_APP_API_URL` environment variable
- Ensure CORS is configured correctly on backend

#### Calendar Not Loading
- Check browser console for JavaScript errors
- Verify react-big-calendar and moment.js are installed
- Clear browser cache and reload

#### Styling Issues
- Check for CSS conflicts
- Verify all CSS files are properly imported
- Use browser dev tools to inspect styles

### Debug Mode
```bash
# Start with debug logging
DEBUG=* npm start

# Enable React developer tools
# Install React DevTools browser extension
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Test thoroughly
5. Commit changes: `git commit -m 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Create a Pull Request

### Code Style
- **ESLint**: Follow configured linting rules
- **Prettier**: Use for code formatting
- **Component Naming**: PascalCase for components
- **File Structure**: Group related files together

## 📚 Dependencies

### Core Dependencies
- **React**: ^19.1.0 - Core framework
- **react-big-calendar**: ^1.19.2 - Calendar component
- **react-redux**: ^9.2.0 - State management
- **react-router-dom**: ^7.6.2 - Routing
- **axios**: ^1.9.0 - HTTP client
- **moment**: For date manipulation
- **date-fns**: ^4.1.0 - Date utilities

### Development Dependencies
- **react-scripts**: ^5.0.1 - Build tools
- **@testing-library/react**: ^16.3.0 - Testing utilities

## 🔮 Future Enhancements

### Planned Features
- **Data Visualization**: Charts and graphs for analytics
- **Export Functions**: PDF/Excel export for timesheets
- **Team Collaboration**: Multi-user support
- **Advanced Filtering**: Search and filter capabilities
- **Offline Support**: PWA with offline functionality
- **Mobile App**: React Native mobile application

### Performance Optimizations
- **Code Splitting**: Lazy loading for components
- **Memoization**: React.memo for component optimization
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Service Workers**: Caching and offline support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Issues**: Create a GitHub issue
- **Documentation**: Check the API Testing Guide
- **Community**: Join our Discord server (link coming soon)

---

Built with ❤️ using React and react-big-calendar
