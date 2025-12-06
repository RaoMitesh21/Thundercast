# 🌍 Airfield Weather Prediction System

A premium Zoom Earth-style React application for real-time airfield weather monitoring and risk assessment.

## ✨ Features

- **Interactive Dark Map**: Zoom Earth-inspired design with dark theme
- **Real-time Weather Overlays**: Wind, clouds, radar, temperature layers
- **Airfield Risk Assessment**: Color-coded risk levels (Green/Yellow/Red)
- **Live Animation**: Animated weather patterns and real-time updates
- **Responsive Design**: Mobile-friendly with touch controls
- **Premium UI**: Glassmorphism effects, smooth animations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Or use the convenient script:
```bash
./run.sh
```

## 🎮 Controls

- **Play/Pause**: Toggle live weather animation
- **Layer Toggles**: Show/hide weather overlays (Wind, Clouds, Radar, Temperature)
- **Map Navigation**: Click and drag to pan, scroll to zoom
- **Airfield Selection**: Click markers to view detailed weather info
- **Reset View**: Return to default map position

## 🏗 Architecture

```
src/
├── components/
│   ├── MapView.jsx         # Main Leaflet map with weather overlays
│   ├── ControlPanel.jsx    # Floating weather info panel
│   └── BottomToolbar.jsx   # Animation and layer controls
├── data/
│   └── mockData.js         # Weather data and airfield locations
└── App.js                  # Main application layout
```

## 🎨 Design System

- **Dark Theme**: Premium black/gray palette
- **Accent Colors**: Blue (#3b82f6), Green (#10b981), Yellow (#f59e0b), Red (#ef4444)
- **Typography**: Inter font family
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React icon set

## 📱 Mobile Experience

- Responsive layout adapts to all screen sizes
- Touch-friendly controls and gestures
- Optimized performance on mobile devices
- Bottom toolbar positioned for thumb access

## 🔧 Technical Stack

- **React 19.1.1**: Latest React with modern hooks
- **Tailwind CSS 3.4.0**: Utility-first styling
- **Leaflet.js**: Interactive map rendering
- **Framer Motion**: Smooth animations
- **Lucide React**: Clean, consistent icons

## 🌐 Live Demo

Visit `http://localhost:3000` after running `npm start`

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## 📄 License

MIT License - Built for Hackovate 2024

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
