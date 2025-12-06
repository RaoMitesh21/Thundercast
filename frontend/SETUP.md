# Airfield Weather Prediction System

A production-ready React dashboard for monitoring airfield weather conditions with real-time alerts and interactive mapping.

## Features

- 🗺️ Interactive map with color-coded risk zones
- ⚡ Real-time weather status and alerts
- 📊 Confidence scoring with visual indicators
- 📱 Fully responsive mobile design
- 🚨 Critical alert system with flashing notifications
- 🎨 Modern Tailwind CSS styling with smooth animations

## Quick Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Run

```bash
# Install dependencies (already done)
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── MapView.jsx      # Interactive Leaflet map
│   ├── AlertPanel.jsx   # Weather status & alerts panel
│   └── StatusBar.jsx    # System status bar
├── data/
│   └── mockData.js      # Mock weather data & zones
└── App.js              # Main application layout
```

## Risk Levels

- 🟢 **Green**: Safe conditions
- 🟡 **Yellow**: Caution advised
- 🔴 **Red**: Danger - Critical alert with flashing banner

## Customization

### Connect Real Backend
Replace mock data in `src/data/mockData.js` with API calls:

```javascript
// Example API integration
const fetchWeatherData = async () => {
  const response = await fetch('/api/weather');
  return response.json();
};
```

### Add Audio Alerts
Uncomment and modify the audio alert in `App.js`:

```javascript
useEffect(() => {
  if (weatherData.risk === 'Red') {
    const audio = new Audio('/alert-sound.mp3');
    audio.play();
  }
}, [weatherData.risk]);
```

## Technologies

- React 19.1.1
- Tailwind CSS 4.1.13
- Leaflet.js 1.9.4
- Lucide React (icons)
- OpenStreetMap tiles

## Build for Production

```bash
npm run build
```

## Demo Data

The system includes realistic mock data for:
- Weather conditions (temperature, wind, humidity, visibility)
- Multiple airfield zones with different risk levels
- Confidence scoring with trend history
- Real-time data simulation

Perfect for hackathon presentations and demos!
