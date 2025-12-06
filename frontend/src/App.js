import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlobeView from './components/GlobeView';
import LayerPanel from './components/LayerPanel';
import WeatherStation from './components/WeatherStation';
import BottomToolbar from './components/BottomToolbar';
import { weatherLayers, airfieldLocations } from './data/mockData';
import mlService from './services/mlService';
import logo from './logo/logo.png';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeLayers, setActiveLayers] = useState({
    wind: true,
    radar: false,
    clouds: true,
    temperature: false
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [mlPredictions, setMlPredictions] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [thunderParams, setThunderParams] = useState(null);
  const [thunderResult, setThunderResult] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Capture latest ML parameters from LayerPanel ("Update Prediction" button triggers this)
  useEffect(() => {
    window.updateMLParameters = (params) => {
      console.log('🔄 Updating ML parameters:', params);
      setThunderParams(params);
    };
    return () => {
      delete window.updateMLParameters;
    };
  }, []);

  // Expose a global runner to fetch prediction from the Flask model using the latest parameters
  useEffect(() => {
    window.runThunderPrediction = async (overrideParams) => {
      try {
        // Get params from LayerPanel if no override
        const liveParams = typeof window.getCurrentMLParams === 'function' ? window.getCurrentMLParams() : null;
        const payload = overrideParams || thunderParams || liveParams;

        console.log('🤖 Running thunder prediction with params:', payload);

        if (payload) {
          const response = await fetch('http://localhost:5001/api/ml/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.error || 'Prediction failed');
          }
          
          setThunderResult(result.data);
          return result.data;
        }

        throw new Error('No ML parameters available');
      } catch (e) {
        console.error('❌ Thunder prediction error:', e);
        setThunderResult(null);
        throw e;
      }
    };
    return () => {
      delete window.runThunderPrediction;
    };
  }, [thunderParams, selectedLocation]);

// ...existing code...

  // Real-time ML predictions for all locations
  useEffect(() => {
    const fetchRealTimePredictions = async () => {
      try {
        const predictions = {};
        
        // Get predictions for all airfield locations
        for (const location of airfieldLocations) {
          try {
            const prediction = await mlService.predictForLocation(location.id);
            if (prediction.success) {
              predictions[location.id] = {
                ...prediction.data,
                locationName: location.name
              };
            }
          } catch (error) {
            console.warn(`Failed to get prediction for ${location.name}:`, error);
          }
        }
        
        setMlPredictions(predictions);
        setLastUpdate(new Date().toISOString());
      } catch (error) {
        console.error('Failed to fetch real-time predictions:', error);
      }
    };

    // Initial fetch
    fetchRealTimePredictions();

    // Set up real-time updates every 5 minutes
    const interval = setInterval(fetchRealTimePredictions, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Enhanced location selection with ML data
  const handleLocationSelectEnhanced = (location) => {
    const enhancedLocation = {
      ...location,
      mlPrediction: mlPredictions[location.id] || null,
      lastMLUpdate: lastUpdate
    };
    setSelectedLocation(enhancedLocation);
  };

  const handleToggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  const handleToggleLayer = (layerId) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black overflow-hidden relative">
      {/* Global Weather Banner */}
      <div className="absolute top-0 left-0 right-0 z-40">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full py-4 text-white font-bold text-center backdrop-blur-xl border-b border-white/10 shadow-lg bg-gradient-to-r from-blue-600/90 to-blue-700/90"
        >
          <div className="flex items-center justify-center space-x-2">
            {/* Thundercast Logo and Text */}
            <div className="flex items-center space-x-2 mr-4">
              <img src={logo} alt="Application Logo" className="h-12 w-auto" />
              <span className="text-3xl font-thundercast text-white tracking-wider drop-shadow-lg" style={{ fontFamily: 'YourCustomThundercastFont, serif' }}>
                Thundercast
              </span>
            </div>
            
            <div className="relative">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <span className="text-sm font-bold text-green-400">LIVE ML Weather Prediction</span>
            <span className="text-lg tracking-wide ml-2">
              🌍 AI-Powered Thunderstorm Monitoring System
            </span>
            {lastUpdate && (
              <span className="text-xs text-blue-200 ml-4">
                Last Update: {new Date(lastUpdate).toLocaleTimeString()}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Optional: tiny status pill for last manual ML run */}
      {thunderResult && (
        <div className="absolute top-20 right-4 z-40 bg-black/60 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2">
          <div className="text-xs text-white">
            Thunder ML: {thunderResult.risk_level} • {(thunderResult.probability * 100).toFixed(1)}%
          </div>
        </div>
      )}

      {/* Weather Station - Right Side (Desktop, 150px from right) */}
      {!isMobile && (
        <div
          className="absolute top-16 right-[150px] z-30"
          style={{ width: '340px' }}
        >
          <WeatherStation
            weatherData={airfieldLocations}
            selectedLocation={selectedLocation}
            mlPredictions={mlPredictions}
          />
        </div>
      )}

      {/* LayerPanel - Right Side (Desktop) */}
      {!isMobile && (
        <LayerPanel
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
          className="absolute right-0 top-16 bottom-20 z-20"
          mlPredictions={mlPredictions}
        />
      )}

      {/* Main 3D Globe - Adjusted margins for both panels based on mobile/desktop */}
      <div className={`h-full relative pt-16 ${!isMobile ? 'pl-0 pr-[490px]' : ''}`}>
        <GlobeView
          isPlaying={isPlaying}
          activeLayers={activeLayers}
          weatherData={airfieldLocations}
          onLocationSelect={handleLocationSelectEnhanced}
          onMarkerClick={setSelectedLocation}
          selectedLocation={selectedLocation}
          mlPredictions={mlPredictions}
        />
      </div>

      {/* Enhanced Bottom Toolbar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <BottomToolbar
          isPlaying={isPlaying}
          onTogglePlay={handleToggleAnimation}
          // Assuming onToggleAnimation is the same as onTogglePlay, if not, define it in App
          onToggleAnimation={handleToggleAnimation} 
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
          layers={weatherLayers} // Pass the full layers array if needed by BottomToolbar
          onZoomIn={() => { /* Placeholder */ }}
          onZoomOut={() => { /* Placeholder */ }}
          onResetView={() => { /* Placeholder */ }}
        />
      </div>

      {/* Mobile Panel Integration (Drawer/Modal for WeatherStation and LayerPanel) */}
      {isMobile && showMobilePanel && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm border-t border-white/20 max-h-[80vh] h-auto overflow-y-auto pb-20" // Increased max-height, added pb-20 for toolbar
        >
          <div className="p-4">
            <WeatherStation
              weatherData={airfieldLocations} // Use validated data
              selectedLocation={selectedLocation}
              className="relative w-full mb-4" // Added bottom margin
            />
            <LayerPanel
              activeLayers={activeLayers}
              onToggleLayer={handleToggleLayer}
              mobile={true}
              className="w-full" // Ensure it takes full width within the mobile panel
            />
          </div>
        </motion.div>
      )}

      {/* Mobile Panel Trigger Button */}
      {isMobile && (
        <button
          onClick={() => setShowMobilePanel(!showMobilePanel)}
          className="absolute bottom-4 left-4 z-30 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/20"
        >
          {showMobilePanel ? 'Hide Panels' : 'Show Panels'}
        </button>
      )}

      {/* ML Predictions Status Indicator */}
      <div className="absolute top-20 left-4 z-30">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${Object.keys(mlPredictions).length > 0 ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-white text-sm font-medium">ML Model Status</span>
          </div>
          <div className="text-xs text-gray-300">
            Active: {Object.keys(mlPredictions).length} / {airfieldLocations.length} locations
          </div>
          {Object.keys(mlPredictions).length > 0 && (
            <div className="text-xs text-blue-300 mt-1">
              High Risk: {Object.values(mlPredictions).filter(p => p.risk_level === 'Red' || p.riskLevel === 'Red').length}
            </div>
          )}
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}

export default App;