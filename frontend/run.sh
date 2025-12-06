#!/bin/bash

echo "🚀 Starting Airfield Weather Prediction System"
echo "==============================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌍 Launching Zoom Earth-style Weather Map..."
npm start
