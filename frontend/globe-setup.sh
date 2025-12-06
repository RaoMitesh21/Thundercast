#!/bin/bash

echo "🌍 Airfield Weather Prediction System - 3D Globe Setup"
echo "====================================================="

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting 3D Globe Weather System..."
echo "Features:"
echo "  ✅ Interactive 3D Globe (react-globe.gl)"
echo "  ✅ Real-time Weather Overlays"
echo "  ✅ Windy-style Control Panel"
echo "  ✅ Animated Risk Indicators"
echo "  ✅ Premium UI/UX"
echo ""
echo "🎮 Controls:"
echo "  • Drag to rotate globe"
echo "  • Scroll to zoom in/out"  
echo "  • Click airfield markers for details"
echo "  • Use bottom toolbar for layers"
echo ""

npm start
