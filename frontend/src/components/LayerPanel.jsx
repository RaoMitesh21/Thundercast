import React, { useState } from 'react';
import { Wind, Radar, Cloud, Thermometer, Settings, ChevronDown, ChevronUp, MapPin, Activity } from 'lucide-react';
import windspeedService from '../services/windspeedService';

const LayerPanel = ({ activeLayers, onToggleLayer, mobile = false, className = '' }) => {
  const [showMLParams, setShowMLParams] = useState(false);
  const [mlParams, setMlParams] = useState({
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

  const layers = [
    {
      key: 'wind',
      name: 'Wind Vectors',
      icon: Wind,
      color: 'blue',
      description: 'Real-time wind speed and direction'
    },
    {
      key: 'radar',
      name: 'Weather Radar',
      icon: Radar,
      color: 'green',
      description: 'Precipitation and storm tracking'
    },
    {
      key: 'clouds',
      name: 'Cloud Cover',
      icon: Cloud,
      color: 'gray',
      description: 'Satellite cloud imagery'
    },
    {
      key: 'temperature',
      name: 'Temperature',
      icon: Thermometer,
      color: 'red',
      description: 'Surface temperature data'
    }
  ];

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive 
        ? 'bg-blue-500/20 border-blue-400 text-blue-300' 
        : 'bg-blue-500/5 border-blue-400/30 text-blue-400/70',
      green: isActive 
        ? 'bg-green-500/20 border-green-400 text-green-300' 
        : 'bg-green-500/5 border-green-400/30 text-green-400/70',
      gray: isActive 
        ? 'bg-gray-500/20 border-gray-400 text-gray-300' 
        : 'bg-gray-500/5 border-gray-400/30 text-gray-400/70',
      red: isActive 
        ? 'bg-red-500/20 border-red-400 text-red-300' 
        : 'bg-red-500/5 border-red-400/30 text-red-400/70'
    };
    
    return colors[color] || colors.gray;
  };

  const getToggleClasses = (color, isActive) => {
    if (isActive) {
      const activeColors = {
        blue: 'bg-blue-400/30 border-blue-400',
        green: 'bg-green-400/30 border-green-400',
        gray: 'bg-gray-400/30 border-gray-400',
        red: 'bg-red-400/30 border-red-400'
      };
      return activeColors[color] || activeColors.gray;
    }
    return 'bg-gray-600/30 border-gray-600';
  };

  const getToggleButtonClasses = (color, isActive) => {
    if (isActive) {
      const activeColors = {
        blue: 'translate-x-5 bg-blue-400',
        green: 'translate-x-5 bg-green-400',
        gray: 'translate-x-5 bg-gray-400',
        red: 'translate-x-5 bg-red-400'
      };
      return activeColors[color] || activeColors.gray;
    }
    return 'translate-x-0 bg-gray-600';
  };

  const panelClasses = mobile 
    ? 'w-full'
    : `w-80 ${className}`;

  const mlParametersConfig = [
    { key: 'wind_sfc_speed_ms', label: 'Surface Wind Speed', unit: 'm/s', min: 0, max: 50, step: 0.1 },
    { key: 'wind_sfc_dir_deg', label: 'Surface Wind Direction', unit: '°', min: 0, max: 360, step: 1 },
    { key: 'wind_500_speed_ms', label: '500mb Wind Speed', unit: 'm/s', min: 0, max: 60, step: 0.1 },
    { key: 'wind_500_dir_deg', label: '500mb Wind Direction', unit: '°', min: 0, max: 360, step: 1 },
    { key: 'temp_2m_C', label: '2m Temperature', unit: '°C', min: -40, max: 50, step: 0.1 },
    { key: 'temp_500_C', label: '500mb Temperature', unit: '°C', min: -60, max: 20, step: 0.1 },
    { key: 'rh_2m_pct', label: 'Relative Humidity', unit: '%', min: 0, max: 100, step: 1 },
    { key: 'pressure_sfc_hPa', label: 'Surface Pressure', unit: 'hPa', min: 950, max: 1050, step: 0.1 },
    { key: 'precipitable_water_mm', label: 'Precipitable Water', unit: 'mm', min: 0, max: 100, step: 0.1 },
    { key: 'cloud_cover_frac', label: 'Cloud Cover', unit: 'fraction', min: 0, max: 1, step: 0.01 },
    { key: 'cloud_top_temp_C', label: 'Cloud Top Temperature', unit: '°C', min: -80, max: 20, step: 0.1 },
    { key: 'CAPE_Jkg', label: 'CAPE', unit: 'J/kg', min: 0, max: 5000, step: 10 },
    { key: 'Lifted_Index_C', label: 'Lifted Index', unit: '°C', min: -10, max: 10, step: 0.1 },
    { key: 'K_index', label: 'K Index', unit: '', min: 0, max: 50, step: 0.1 },
    { key: 'shear_850_500_ms', label: 'Wind Shear 850-500mb', unit: 'm/s', min: 0, max: 50, step: 0.1 }
  ];

  const handleParamChange = (key, value) => {
    setMlParams(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  };

  const resetToDefaults = () => {
    setMlParams({
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
  };

  return (
    <div className={`${panelClasses} bg-black/30 backdrop-blur-sm border-l border-white/10 p-4 overflow-y-auto`}>
      {/* Weather Station Status */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/20">
        <div className="flex items-center space-x-3 mb-3">
          <MapPin className="w-5 h-5 text-blue-400" />
          <h2 className="text-white text-lg font-semibold">Weather Station</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Global Overview</span>
            <div className="flex items-center space-x-2">
              <Activity className="w-3 h-3 text-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">ONLINE</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Monitoring Stations:</span>
            <span className="text-white text-xs font-medium">12 Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Data Quality:</span>
            <span className="text-green-400 text-xs font-medium">Excellent</span>
          </div>
        </div>
      </div>

      {/* Active Layers */}
      <div className="mb-6">
        <h2 className="text-white text-lg font-semibold mb-2">Active Layers</h2>
        <p className="text-gray-400 text-sm mb-4">Toggle weather data overlays</p>

        <div className="grid grid-cols-1 gap-3">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayers[layer.key];
            
            return (
              <div
                key={layer.key}
                className={`p-3 rounded-lg border transition-all cursor-pointer hover:scale-102 ${getColorClasses(layer.color, isActive)}`}
                onClick={() => onToggleLayer(layer.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <div>
                      <span className="font-medium text-sm">{layer.name}</span>
                      <p className="text-xs opacity-70 mt-1">{layer.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-4 rounded-full border transition-colors ${getToggleClasses(layer.color, isActive)}`}>
                      <div className={`w-3 h-3 rounded-full transition-transform ${getToggleButtonClasses(layer.color, isActive)}`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ML Parameters Section */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowMLParams(!showMLParams)}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-purple-400" />
            <h3 className="text-white font-medium">ML Parameters</h3>
          </div>
          {showMLParams ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
        
        {showMLParams && (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-gray-400 mb-3">
              Adjust weather parameters for thunderstorm prediction
            </p>
            
            {/* Wind Parameters */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-300 border-b border-blue-400/20 pb-1">
                Wind Parameters
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {mlParametersConfig.filter(p => p.key.includes('wind')).map(param => (
                  <div key={param.key} className="flex items-center justify-between">
                    <label className="text-xs text-gray-300 flex-1 pr-2">
                      {param.label}
                    </label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={mlParams[param.key]}
                        onChange={(e) => handleParamChange(param.key, e.target.value)}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        className="w-16 px-1 py-0.5 text-xs bg-gray-800 border border-gray-600 rounded text-white"
                      />
                      <span className="text-xs text-gray-400 w-6">{param.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Temperature Parameters */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-300 border-b border-red-400/20 pb-1">
                Temperature
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {mlParametersConfig.filter(p => p.key.includes('temp')).map(param => (
                  <div key={param.key} className="flex items-center justify-between">
                    <label className="text-xs text-gray-300 flex-1 pr-2">
                      {param.label}
                    </label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={mlParams[param.key]}
                        onChange={(e) => handleParamChange(param.key, e.target.value)}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        className="w-16 px-1 py-0.5 text-xs bg-gray-800 border border-gray-600 rounded text-white"
                      />
                      <span className="text-xs text-gray-400 w-6">{param.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Atmospheric Parameters */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-yellow-300 border-b border-yellow-400/20 pb-1">
                Key Indices
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {['CAPE_Jkg', 'Lifted_Index_C', 'rh_2m_pct', 'pressure_sfc_hPa'].map(key => {
                  const param = mlParametersConfig.find(p => p.key === key);
                  return (
                    <div key={param.key} className="flex items-center justify-between">
                      <label className="text-xs text-gray-300 flex-1 pr-2">
                        {param.label}
                      </label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={mlParams[param.key]}
                          onChange={(e) => handleParamChange(param.key, e.target.value)}
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          className="w-16 px-1 py-0.5 text-xs bg-gray-800 border border-gray-600 rounded text-white"
                        />
                        <span className="text-xs text-gray-400 w-6">{param.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parameter Actions */}
            <div className="flex space-x-2 mt-4">
              <button
                onClick={resetToDefaults}
                className="flex-1 py-2 px-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 text-gray-300 rounded text-xs font-medium transition-colors"
              >
                Reset Defaults
              </button>
              <button
                onClick={async () => {
                  // Trigger prediction with current parameters via API
                  try {
                    const response = await fetch('http://localhost:5001/api/ml/predict', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(mlParams),
                    });
                    
                    if (response.ok) {
                      const result = await response.json();
                      console.log('ML Prediction result:', result);
                      
                      // Show notification or update UI with result
                      if (result.success) {
                        alert(`Prediction: ${result.data.risk_level} - ${result.data.alert}`);
                      }
                    }
                  } catch (error) {
                    console.error('Prediction failed:', error);
                    alert('Prediction failed. Check console for details.');
                  }
                }}
                className="flex-1 py-2 px-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-300 rounded text-xs font-medium transition-colors"
              >
                Run Prediction
              </button>
              <button
                onClick={async () => {
                  // Test windspeed prediction
                  try {
                    const windParams = {
                      'IND': 1.2, 'RAIN': 0.5, 'IND.1': 0.8, 'T.MAX': 25.0, 'IND.2': 1.1, 'T.MIN.G': 15.0,
                      'wind_lag_1': 8.5, 'wind_lag_2': 7.2, 'wind_lag_3': 9.1,
                      'ma_3': 8.3, 'ma_5': 8.1, 'ma_7': 7.9,
                      'std_3': 1.2, 'std_5': 1.5, 'std_7': 1.8
                    };
                    
                    const response = await windspeedService.predictWindspeed(windParams);
                    
                    if (response.success) {
                      alert(`Windspeed: ${response.data.predicted_windspeed.toFixed(1)} m/s - ${response.data.alert}`);
                    }
                  } catch (error) {
                    console.error('Windspeed prediction failed:', error);
                    alert('Windspeed prediction failed. Check console for details.');
                  }
                }}
                className="flex-1 py-2 px-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-green-300 rounded text-xs font-medium transition-colors"
              >
                Test Windspeed
              </button>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setMlParams({
                  ...mlParams,
                  CAPE_Jkg: 3000,
                  Lifted_Index_C: -5,
                  rh_2m_pct: 90,
                  pressure_sfc_hPa: 990
                })}
                className="py-1 px-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 rounded text-xs transition-colors"
              >
                Severe
              </button>
              <button
                onClick={() => setMlParams({
                  ...mlParams,
                  CAPE_Jkg: 500,
                  Lifted_Index_C: 2,
                  rh_2m_pct: 40,
                  pressure_sfc_hPa: 1020
                })}
                className="py-1 px-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-green-300 rounded text-xs transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Layer Statistics */}
      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
        <h3 className="text-white font-medium mb-3 text-sm">System Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Active Layers:</span>
            <span className="text-white font-medium">{Object.values(activeLayers).filter(Boolean).length}/4</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Update Rate:</span>
            <span className="text-green-400 font-medium">15s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">ML Model:</span>
            <span className="text-purple-400 font-medium">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayerPanel;

