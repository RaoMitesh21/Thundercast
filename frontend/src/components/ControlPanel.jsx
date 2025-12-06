import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Wind, Eye, Thermometer, Droplets, Activity, Clock, MapPin, Satellite } from 'lucide-react';

const ControlPanel = ({ weatherData, selectedLocation, isVisible, isMobile }) => {
  if (!weatherData) return null;

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskBgColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskGlow = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'green': return 'shadow-green-500/50';
      case 'yellow': return 'shadow-yellow-500/50';
      case 'red': return 'shadow-red-500/50';
      default: return 'shadow-gray-500/50';
    }
  };

  const panelVariants = {
    hidden: isMobile ? { y: '100%', opacity: 0 } : { x: 400, opacity: 0 },
    visible: isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 },
    exit: isMobile ? { y: '100%', opacity: 0 } : { x: 400, opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={panelVariants}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`${
            isMobile 
              ? 'fixed bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto'
              : 'fixed right-6 top-1/2 transform -translate-y-1/2 w-96'
          } bg-black/95 backdrop-blur-2xl rounded-t-2xl ${!isMobile && 'rounded-2xl'} border border-white/10 shadow-2xl z-30`}
        >
          {/* Windy-style Header */}
          <div className="bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-cyan-500/20 p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-blue-400" />
                  Weather Station
                </h2>
                <p className="text-blue-200 text-sm font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedLocation?.name || weatherData.location || 'Global Overview'}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRiskBgColor(weatherData.risk)} text-white shadow-lg ${getRiskGlow(weatherData.risk)}`}>
                {weatherData.risk}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            
            {/* Risk Assessment - Windy Style */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                  Risk Assessment
                </h3>
                <div className="flex items-center space-x-2">
                  <Satellite className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Live satellite data</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-3xl font-black ${getRiskColor(weatherData.risk)}`}>
                    {weatherData.risk?.toUpperCase()}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Confidence</div>
                    <div className="text-2xl font-bold text-white">{weatherData.confidence || 85}%</div>
                  </div>
                </div>
                
                {/* Enhanced Progress bar */}
                <div className="relative w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${weatherData.confidence || 85}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={`h-3 rounded-full ${getRiskBgColor(weatherData.risk)} shadow-lg relative overflow-hidden`}
                  >
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Weather Metrics Grid - Enhanced */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-4 border border-blue-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center mb-2">
                  <Wind className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-blue-200">Wind Speed</span>
                </div>
                <div className="text-xl font-bold text-white">{weatherData.wind || '12 mph'}</div>
                <div className="text-xs text-blue-300 mt-1">Gusting to 18 mph</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-4 border border-green-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center mb-2">
                  <Eye className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-sm font-medium text-green-200">Visibility</span>
                </div>
                <div className="text-xl font-bold text-white">{weatherData.visibility || '10 km'}</div>
                <div className="text-xs text-green-300 mt-1">Clear conditions</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 rounded-xl p-4 border border-orange-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center mb-2">
                  <Thermometer className="w-5 h-5 text-orange-400 mr-2" />
                  <span className="text-sm font-medium text-orange-200">Temperature</span>
                </div>
                <div className="text-xl font-bold text-white">{weatherData.temperature || '22°C'}</div>
                <div className="text-xs text-orange-300 mt-1">Feels like 24°C</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 rounded-xl p-4 border border-cyan-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center mb-2">
                  <Droplets className="w-5 h-5 text-cyan-400 mr-2" />
                  <span className="text-sm font-medium text-cyan-200">Humidity</span>
                </div>
                <div className="text-xl font-bold text-white">{weatherData.humidity || '65%'}</div>
                <div className="text-xs text-cyan-300 mt-1">Dew point 18°C</div>
              </motion.div>
            </div>

            {/* Enhanced Alert Message */}
            {(weatherData.alert || selectedLocation?.status !== 'Clear') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`relative p-5 rounded-xl border-l-4 overflow-hidden ${
                  weatherData.risk?.toLowerCase() === 'red'
                    ? 'bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-400 text-red-100'
                    : weatherData.risk?.toLowerCase() === 'yellow'
                    ? 'bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-yellow-400 text-yellow-100'
                    : 'bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-400 text-green-100'
                }`}
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                />
                <div className="relative flex items-start">
                  <AlertTriangle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold mb-2 text-lg">Weather Alert</h4>
                    <p className="text-sm leading-relaxed">
                      {weatherData.alert || `${selectedLocation?.status} conditions detected at ${selectedLocation?.name}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Last Updated */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 pt-4 border-t border-white/10">
              <Clock className="w-3 h-3" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ControlPanel;
