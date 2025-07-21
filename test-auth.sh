#!/bin/bash

# Test the authentication endpoints
echo "Testing TimeSheet Tracker Authentication API"
echo "============================================="

# Test registration
echo "1. Testing user registration..."
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }' | json_pp

echo -e "\n2. Testing user login..."
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | json_pp

echo -e "\n3. Testing protected timesheet endpoint (should require auth)..."
curl -X GET http://localhost:5000/api/timesheet-entries \
  -H "Content-Type: application/json"

echo -e "\n\nAPI test complete!"
