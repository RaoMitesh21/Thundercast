import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WeatherPredictionService } from '../services/weatherAPI';
import { Brain, Zap, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';

const PredictionPanel = ({ isVisible, onClose, mobile = false, className = '' }) => {
  const [weatherInputs, setWeatherInputs] = useState({
    wind_sfc_speed_ms: 10,
    wind_sfc_dir_deg: 180,
    wind_500_speed_ms: 15,
    wind_500_dir_deg: 180,
    temp_2m_C: 20,
    temp_500_C: -5,
    rh_2m_pct: 60,
    pressure_sfc_hPa: 1013,
    precipitable_water_mm: 25,
    cloud_cover_frac: 0.5,
    cloud_top_temp_C: -20,
    CAPE_Jkg: 1000,
    Lifted_Index_C: 0,
    K_index: 25,
    shear_850_500_ms: 10
  });

  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const featureLabels = {
    wind_sfc_speed_ms: 'Surface Wind Speed (m/s)',
    wind_sfc_dir_deg: 'Surface Wind Direction (°)',
    wind_500_speed_ms: '500mb Wind Speed (m/s)',
    wind_500_dir_deg: '500mb Wind Direction (°)',
    temp_2m_C: '2m Temperature (°C)',
    temp_500_C: '500mb Temperature (°C)',
    rh_2m_pct: 'Relative Humidity (%)',
    pressure_sfc_hPa: 'Surface Pressure (hPa)',
    precipitable_water_mm: 'Precipitable Water (mm)',
    cloud_cover_frac: 'Cloud Cover (0-1)',
    cloud_top_temp_C: 'Cloud Top Temp (°C)',
    CAPE_Jkg: 'CAPE (J/kg)',
    Lifted_Index_C: 'Lifted Index (°C)',
    K_index: 'K Index',
    shear_850_500_ms: 'Wind Shear (m/s)'
  };

  const handleInputChange = (feature, value) => {
    setWeatherInputs(prev => ({
      ...prev,
      [feature]: parseFloat(value) || 0
    }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await WeatherPredictionService.predictThunderstorm(weatherInputs);
      setPrediction(result);
    } catch (err) {
      setError('Failed to get prediction. Please check if the ML server is running.');
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (presetType) => {
    const presets = {
      severe: {
        wind_sfc_speed_ms: 20,
        wind_sfc_dir_deg: 225,
        wind_500_speed_ms: 30,
        wind_500_dir_deg: 240,
        temp_2m_C: 28,
        temp_500_C: -8,
        rh_2m_pct: 85,
        pressure_sfc_hPa: 990,
        precipitable_water_mm: 45,
        cloud_cover_frac: 0.9,
        cloud_top_temp_C: -40,
        CAPE_Jkg: 3500,
        Lifted_Index_C: -5,
        K_index: 35,
        shear_850_500_ms: 20
      },
      moderate: {
        wind_sfc_speed_ms: 12,
        wind_sfc_dir_deg: 180,
        wind_500_speed_ms: 18,
        wind_500_dir_deg: 200,
        temp_2m_C: 24,
        temp_500_C: -3,
        rh_2m_pct: 70,
        pressure_sfc_hPa: 1005,
        precipitable_water_mm: 30,
        cloud_cover_frac: 0.6,
        cloud_top_temp_C: -25,
        CAPE_Jkg: 1800,
        Lifted_Index_C: -1,
        K_index: 28,
        shear_850_500_ms: 12
      },
      calm: {
        wind_sfc_speed_ms: 5,
        wind_sfc_dir_deg: 90,
        wind_500_speed_ms: 8,
        wind_500_dir_deg: 120,
        temp_2m_C: 22,
        temp_500_C: 0,
        rh_2m_pct: 45,
        pressure_sfc_hPa: 1020,
        precipitable_water_mm: 15,
        cloud_cover_frac: 0.2,
        cloud_top_temp_C: -10,
        CAPE_Jkg: 500,
        Lifted_Index_C: 3,
        K_index: 20,
        shear_850_500_ms: 5
      }
    };

    setWeatherInputs(presets[presetType]);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Red': return 'text-red-400 bg-red-500/20 border-red-400/30';
      case 'Yellow': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      case 'Green': return 'text-green-400 bg-green-500/20 border-green-400/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  if (!isVisible) return null;

  const panelClasses = mobile 
    ? 'fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto'
    : `w-96 ${className} bg-black/30 backdrop-blur-sm border-l border-white/10 overflow-y-auto`;

  return (
    <motion.div
      initial={{ x: mobile ? 0 : 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: mobile ? 0 : 400, opacity: 0 }}
      className={panelClasses}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-lg font-semibold">ML Prediction</h2>
          </div>
          {mobile && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Quick Presets</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => loadPreset('severe')}
              className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-colors text-sm"
            >
              Severe
            </button>
            <button
              onClick={() => loadPreset('moderate')}
              className="px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30 transition-colors text-sm"
            >
              Moderate
            </button>
            <button
              onClick={() => loadPreset('calm')}
              className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg border border-green-400/30 hover:bg-green-500/30 transition-colors text-sm"
            >
              Calm
            </button>
          </div>
        </div>

        {/* Weather Inputs */}
        <div className="space-y-4 mb-6">
          <h3 className="text-white font-medium">Weather Parameters</h3>
          
          {Object.entries(weatherInputs).map(([feature, value]) => (
            <div key={feature} className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">
                {featureLabels[feature]}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleInputChange(feature, e.target.value)}
                step={feature.includes('frac') ? 0.1 : feature.includes('dir') ? 1 : 0.1}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Predict Button */}
        <button
          onClick={handlePredict}
          disabled={isLoading}
          className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Predicting...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Get Prediction</span>
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Prediction Results */}
        {prediction && prediction.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Prediction Results</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Risk Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm border ${getRiskColor(prediction.risk_level)}`}>
                  {prediction.risk_level}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Probability:</span>
                <span className="text-white font-medium">
                  {(prediction.probability * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Confidence:</span>
                <span className="text-white font-medium">
                  {prediction.confidence.toFixed(1)}%
                </span>
              </div>
              
              <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-400/20">
                <span className="text-blue-300 text-sm">{prediction.alert}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PredictionPanel;
