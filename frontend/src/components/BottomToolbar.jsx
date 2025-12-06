import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Layers, RotateCcw, Globe, Wind, Cloud, Radar, ZoomIn, ZoomOut, Home } from 'lucide-react';

const BottomToolbar = ({ isPlaying, onToggleAnimation, layers, onToggleLayer, onZoomIn, onZoomOut, onResetView }) => {
  const getLayerIcon = (layerId) => {
    switch (layerId) {
      case 'wind': return <Wind className="w-4 h-4" />;
      case 'clouds': return <Cloud className="w-4 h-4" />;
      case 'radar': return <Radar className="w-4 h-4" />;
      case 'temperature': return <Globe className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-black/95 backdrop-blur-2xl rounded-2xl px-6 py-4 border border-white/10 shadow-2xl"
    >
      <div className="flex items-center space-x-6">
        
        {/* Animation Control */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleAnimation}
          className={`p-3 rounded-xl transition-all shadow-lg ${
            isPlaying 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/25' 
              : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-gray-200'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </motion.button>

        {/* Divider */}
        <div className="w-px h-8 bg-white/20" />

        {/* Layer Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-200 font-medium">Weather Layers</span>
          </div>
          <div className="flex space-x-2">
            {layers.map((layer) => (
              <motion.button
                key={layer.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleLayer(layer.id)}
                className={`p-2 rounded-xl transition-all flex items-center space-x-2 ${
                  layer.active
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                }`}
                title={layer.name}
              >
                {getLayerIcon(layer.id)}
                <span className="text-xs font-medium hidden sm:inline">{layer.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-white/20" />

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400 font-medium hidden sm:inline">Zoom</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onZoomIn}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors border border-white/10"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onZoomOut}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors border border-white/10"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Reset Control */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onResetView}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors border border-white/10"
          title="Reset to Global View"
        >
          <Home className="w-5 h-5" />
        </motion.button>

        {/* Divider */}
        <div className="w-px h-8 bg-white/20" />

        {/* Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-gray-500'}`} />
            <span className={`text-sm font-bold ${isPlaying ? 'text-green-400' : 'text-gray-500'}`}>
              {isPlaying ? 'LIVE DATA' : 'PAUSED'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BottomToolbar;
