# 🌍 Airfield Weather Prediction System - 3D Globe Edition

A premium **Nullschool/Zoom Earth-style 3D globe** with **Windy.com-inspired UI panels** for real-time airfield weather monitoring and risk assessment.

## ✨ Key Features

### 🌐 Interactive 3D Globe
- **react-globe.gl** powered rotating Earth
- **Smooth rotation, zoom, and pan controls**
- **Real-time weather overlays** (wind vectors, clouds, radar)
- **Animated airfield markers** with risk-based coloring
- **Connection arcs** between high-risk locations

### 🎛 Windy-Style Interface  
- **Premium control panel** with glassmorphism effects
- **Live weather metrics** with animated progress bars
- **Risk assessment dashboard** with confidence scoring
- **Layer toggle controls** (Wind, Clouds, Radar, Temperature)
- **Play/pause animation system**

### 🚨 Advanced Alert System
- **Real-time risk monitoring** (Green/Yellow/Red levels)
- **Animated alert banners** with sound-ready triggers
- **Location-specific weather warnings**
- **System status indicators**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the 3D globe system  
npm start

# Or use the setup script
./globe-setup.sh
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎮 Interactive Controls

| Control | Action |
|---------|--------|
| **Drag** | Rotate the globe |
| **Scroll** | Zoom in/out |
| **Click markers** | View airfield details |
| **Play/Pause** | Toggle live weather animation |
| **Layer buttons** | Show/hide weather overlays |
| **Reset** | Return to default view |

## 🏗 Architecture

```
src/
├── components/
│   ├── GlobeView.jsx       # 3D globe with react-globe.gl
│   ├── ControlPanel.jsx    # Windy-style weather panel  
│   └── BottomToolbar.jsx   # Layer controls and animation
├── data/
│   └── mockData.js         # Weather data and locations
└── App.js                  # Main layout and state management
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6), Cyan (#06b6d4) 
- **Risk Levels**: Green (#10b981), Yellow (#f59e0b), Red (#ef4444)
- **Background**: Gradient from slate-900 to black
- **Accents**: White/10 borders, backdrop-blur effects

### Animations
- **Framer Motion** for panel transitions
- **Globe auto-rotation** at 0.8 speed
- **Pulsing risk indicators** 
- **Animated progress bars** with shine effects
- **Weather layer opacity** cycling

## 🛠 Technical Stack

- **React 19.1.1** - Latest React with hooks
- **Tailwind CSS 3.4.0** - Utility-first styling  
- **react-globe.gl** - 3D globe rendering
- **Three.js** - WebGL graphics engine
- **Framer Motion** - Advanced animations
- **Lucide React** - Premium icon set

## 📱 Responsive Design

- **Desktop**: Full 3D globe with side panel
- **Tablet**: Adapted controls and touch gestures  
- **Mobile**: Bottom drawer panel, touch-friendly buttons

## 🌐 Demo Data

The system includes realistic mock data:
- **8 major international airports**
- **Real-time weather simulation**
- **Risk level transitions** 
- **Confidence scoring** (60-98%)
- **Wind vector generation**

## 🔧 Configuration

### Weather Layers
```javascript
const weatherLayers = [
  { id: 'wind', name: 'Wind', active: true },
  { id: 'clouds', name: 'Clouds', active: false },
  { id: 'radar', name: 'Radar', active: false },
  { id: 'temperature', name: 'Temperature', active: false }
];
```

### Globe Settings
```javascript
// Auto-rotation speed
autoRotateSpeed: 0.8

// Default camera position  
pointOfView: { lat: 25, lng: 0, altitude: 2.2 }

// Atmosphere effects
atmosphereColor: "#3b82f6"
atmosphereAltitude: 0.2
```

## 🚀 Production Deployment

```bash
# Build for production
npm run build

# The build folder contains optimized static files
# Deploy to any static hosting service (Vercel, Netlify, etc.)
```

## 🎯 Hackathon Ready

This is a **production-ready demo** perfect for:
- **Aviation weather monitoring**
- **Risk assessment dashboards** 
- **3D data visualization**
- **Real-time alert systems**

## 📄 License

MIT License - Built for **Hackovate 2024** 

---

**🌍 Experience the future of weather monitoring with our 3D globe interface!**
