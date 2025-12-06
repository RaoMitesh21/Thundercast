# 🌍 Airfield Weather Prediction System - 3D Globe

A premium **Zoom Earth/Nullschool-style** interactive 3D globe for monitoring global airfield weather conditions with real-time predictions and animated weather layers.

## ✨ Features

- 🌍 **Interactive 3D Globe** with smooth rotation and zoom (like earth.nullschool.net)
- 🌪️ **Animated Weather Layers** - Wind vectors, radar, clouds, temperature
- ✈️ **Global Airfield Monitoring** - Major airports with color-coded risk levels
- 📱 **Responsive Design** - Mobile-friendly with collapsible panels
- 🎮 **Zoom Earth Controls** - Play/pause, layer toggles, zoom controls
- 🚨 **Real-time Alerts** - Critical weather warnings with confidence scoring
- 🎨 **Premium UI** - Glass morphism design with smooth animations

## 🚀 Quick Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation & Run
```bash
# Dependencies already installed:
# - react-globe.gl (3D globe)
# - framer-motion (animations)
# - three.js (3D rendering)
# - tailwindcss (styling)

# Start development server
npm start
```

**Application runs at:** `http://localhost:3000`

## 🗂️ Project Structure

```
src/
├── components/
│   ├── GlobeView.jsx        # 3D interactive globe with weather layers
│   ├── ControlPanel.jsx     # Floating weather status panel
│   └── BottomToolbar.jsx    # Zoom Earth-style controls
├── data/
│   └── mockData.js         # Global airfield data & weather simulation
└── App.js                  # Main layout with responsive design
```

## 🎮 Controls

### Bottom Toolbar (Zoom Earth Style)
- ▶️ **Play/Pause** - Animate weather patterns
- 🌊 **Wind Layer** - Animated wind vectors
- ☁️ **Clouds Layer** - Cloud coverage overlay  
- 📡 **Radar Layer** - Weather radar connections
- 🌡️ **Temperature Layer** - Temperature visualization
- 🔍 **Zoom In/Out** - Globe navigation
- 🔄 **Reset View** - Return to global view

### Interactive Features
- **Click airports** - View detailed weather info
- **Drag to rotate** - Explore the globe
- **Scroll to zoom** - Smooth zoom controls
- **Auto-rotation** - Continuous globe spinning when playing

## 🌈 Risk Levels

- 🔴 **Red** - Critical weather conditions
- 🟡 **Yellow** - Caution advised  
- 🟢 **Green** - Safe conditions

## 📍 Monitored Locations

- **JFK International** (New York, USA)
- **Heathrow Airport** (London, UK)
- **Frankfurt Airport** (Germany)
- **Tokyo Haneda** (Japan)
- **Dubai International** (UAE)

## 🛠️ Customization

### Connect Real APIs
Replace mock data in `src/data/mockData.js`:

```javascript
// Example API integration
const fetchGlobalWeather = async () => {
  const response = await fetch('/api/global-weather');
  return response.json();
};
```

### Add More Airports
```javascript
// In mockData.js
export const airfieldLocations = [
  {
    id: 6,
    name: "Los Angeles LAX",
    lat: 33.9425,
    lng: -118.4081,
    risk: "Green",
    status: "Clear Conditions",
    country: "USA"
  }
  // Add more...
];
```

### Custom Weather Layers
```javascript
// Add new layer types
export const weatherLayers = [
  { id: 'precipitation', name: 'Rain', active: false, color: '#4A90E2' },
  { id: 'lightning', name: 'Lightning', active: false, color: '#FFD700' }
];
```

## 🎨 Technologies

- **React 19.1.1** - Frontend framework
- **React Globe.gl** - 3D globe rendering
- **Three.js** - 3D graphics engine
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icons

## 📱 Mobile Experience

- **Responsive Layout** - Adapts to all screen sizes
- **Touch Controls** - Pinch to zoom, drag to rotate
- **Collapsible Panel** - Control panel becomes bottom drawer
- **Mobile-optimized** - Touch-friendly buttons and interactions

## 🏗️ Build for Production

```bash
# Create optimized production build
npm run build

# Serve production build locally
npx serve -s build
```

## 🎯 Demo Features

- **Realistic Weather Simulation** - Live-updating weather data
- **Smooth Animations** - 60fps globe rotation and layer transitions  
- **Global Coverage** - Worldwide weather monitoring visualization
- **Professional UI** - Production-ready design for presentations

Perfect for **hackathon demos**, **weather visualization**, and **aviation monitoring systems**! 

The 3D globe interface provides an immersive experience that showcases global weather prediction capabilities in a visually stunning format. 🌟
