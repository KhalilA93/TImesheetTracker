#!/bin/bash

# Frontend compilation test script
echo "🧪 Testing Frontend Compilation..."

cd frontend

echo "📦 Installing dependencies..."
npm install --silent

echo "🔍 Checking for TypeScript/ESLint errors..."
npm run build --silent > build.log 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Frontend compilation successful!"
    echo "🚀 Ready to start development server with: npm start"
    rm -f build.log
else
    echo "❌ Compilation failed. Check errors below:"
    cat build.log
    rm -f build.log
    exit 1
fi
