#!/bin/bash

# TimeSheet Tracker Development Server Manager

echo "🚀 TimeSheet Tracker Development Environment"
echo "============================================="

# Function to start backend
start_backend() {
    echo "📊 Starting Backend Server..."
    cd backend
    if [ ! -f ".env" ]; then
        echo "⚠️  No .env file found in backend directory"
        echo "Please create a .env file with your MongoDB connection string"
        return 1
    fi
    
    echo "Installing backend dependencies..."
    npm install
    
    echo "Starting server on port 5000..."
    node server.js &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🌐 Starting Frontend Development Server..."
    cd frontend
    
    echo "Installing frontend dependencies..."
    npm install
    
    echo "Starting React development server..."
    npm start &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    cd ..
}

# Function to stop servers
stop_servers() {
    echo "🛑 Stopping development servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "Frontend server stopped"
    fi
}

# Trap to ensure cleanup on script exit
trap stop_servers EXIT

# Main execution
case "${1:-both}" in
    "backend")
        start_backend
        echo "✅ Backend server running on http://localhost:5000"
        echo "📡 API endpoint: http://localhost:5000/api"
        wait
        ;;
    "frontend")
        start_frontend
        echo "✅ Frontend server will start on http://localhost:3000"
        wait
        ;;
    "both"|*)
        start_backend
        sleep 3
        start_frontend
        
        echo ""
        echo "🎉 Development environment is ready!"
        echo "📊 Backend API: http://localhost:5000/api"
        echo "🌐 Frontend App: http://localhost:3000"
        echo ""
        echo "Press Ctrl+C to stop both servers"
        
        wait
        ;;
esac
