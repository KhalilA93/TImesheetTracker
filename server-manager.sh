#!/bin/bash

# TimeSheet Tracker Server Management Script

echo "🚀 TimeSheet Tracker Server Manager"
echo "=================================="

# Function to kill processes on port 5000
kill_port_5000() {
    echo "🔍 Checking for processes on port 5000..."
    PIDS=$(netstat -ano | findstr :5000 | awk '{print $5}' | sort -u)
    if [ ! -z "$PIDS" ]; then
        echo "🔪 Killing processes on port 5000..."
        for pid in $PIDS; do
            taskkill //PID $pid //F 2>/dev/null
        done
        echo "✅ Port 5000 cleared"
    else
        echo "✅ Port 5000 is already free"
    fi
}

# Function to start server
start_server() {
    echo "🚀 Starting TimeSheet Tracker server..."
    cd "$(dirname "$0")/backend"
    node server.js
}

# Function to check server status
check_server() {
    echo "🔍 Checking server status..."
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "✅ Server is running and responding"
        curl -s http://localhost:5000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/health
    else
        echo "❌ Server is not responding"
    fi
}

# Main menu
case "$1" in
    "start")
        kill_port_5000
        start_server
        ;;
    "stop")
        kill_port_5000
        ;;
    "restart")
        kill_port_5000
        sleep 2
        start_server
        ;;
    "status")
        check_server
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Kill any existing processes and start server"
        echo "  stop    - Stop server (kill processes on port 5000)"
        echo "  restart - Stop and start server"
        echo "  status  - Check if server is running"
        echo ""
        echo "Examples:"
        echo "  bash server-manager.sh start"
        echo "  bash server-manager.sh status"
        exit 1
        ;;
esac
