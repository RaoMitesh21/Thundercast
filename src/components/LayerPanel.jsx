// import React, { useState, useEffect } from 'react';

// const LayerPanel = ({ activeLayers, onToggleLayer, mobile = false, className = '' }) => {
//   const [showMLParams, setShowMLParams] = useState(false);
//   const [mlParams, setMlParams] = useState({
//     wind_sfc_speed_ms: 10,
//     wind_sfc_dir_deg: 180,
//     wind_500_speed_ms: 15,
//     wind_500_dir_deg: 180,
//     temp_2m_C: 20,
//     temp_500_C: -5,
//     rh_2m_pct: 60,
//     pressure_sfc_hPa: 1013,
//     precipitable_water_mm: 25,
//     cloud_cover_frac: 0.5,
//     cloud_top_temp_C: -20,
//     CAPE_Jkg: 1000,
//     Lifted_Index_C: 0,
//     K_index: 25,
//     shear_850_500_ms: 10
//   });

//   // Expose current params and seed initial values to App so predictions work without extra clicks
//   useEffect(() => {
//     // make latest params readable by App
//     window.getCurrentMLParams = () => mlParams;

//     // seed once on mount if App is listening
//     if (typeof window.updateMLParameters === 'function') {
//       window.updateMLParameters(mlParams);
//     }

//     return () => {
//       delete window.getCurrentMLParams;
//     };
//   }, []); // run once on mount

//   // Keep the exposed getter up-to-date as user edits sliders
//   useEffect(() => {
//     window.getCurrentMLParams = () => mlParams;
//   }, [mlParams]);

//   return (
//     <div className={`layer-panel ${className}`}>
//       {/* ...existing LayerPanel content... */}
//     </div>
//   );
// };

// export default LayerPanel;

import React, { useState, useEffect } from 'react';
import { Wind, Radar, Cloud, Thermometer, Settings, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

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

  // IMMEDIATELY expose params and seed initial values
  useEffect(() => {
    window.getCurrentMLParams = () => mlParams;
    
    // SEED IMMEDIATELY on mount
    if (typeof window.updateMLParameters === 'function') {
      window.updateMLParameters(mlParams);
    }

    return () => {
      delete window.getCurrentMLParams;
    };
  }, [mlParams]); // Update when params change

  const panelClasses = mobile ? 'w-full' : `w-80`;

  const handleParamChange = (key, value) => {
    const newParams = {
      ...mlParams,
      [key]: parseFloat(value)
    };
    setMlParams(newParams);
    
    // IMMEDIATELY update App with new params
    if (typeof window.updateMLParameters === 'function') {
      window.updateMLParameters(newParams);
    }
  };

  const resetToDefaults = () => {
    const defaults = {
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
    };
    setMlParams(defaults);
    
    // Update App with defaults
    if (typeof window.updateMLParameters === 'function') {
      window.updateMLParameters(defaults);
    }
  };

  // ML Parameters Configuration
  const mlParametersConfig = [
    {
      title: "Wind",
      params: [
        { key: 'wind_sfc_speed_ms', label: 'Surface Wind Speed', min: 0, max: 50, step: 0.1, unit: 'm/s' },
        { key: 'wind_sfc_dir_deg', label: 'Surface Wind Direction', min: 0, max: 360, step: 1, unit: '°' },
        { key: 'wind_500_speed_ms', label: '500mb Wind Speed', min: 0, max: 80, step: 0.1, unit: 'm/s' },
        { key: 'wind_500_dir_deg', label: '500mb Wind Direction', min: 0, max: 360, step: 1, unit: '°' },
        { key: 'shear_850_500_ms', label: 'Wind Shear', min: 0, max: 40, step: 0.1, unit: 'm/s' }
      ]
    },
    {
      title: "Temperature",
      params: [
        { key: 'temp_2m_C', label: '2m Temperature', min: -40, max: 50, step: 0.1, unit: '°C' },
        { key: 'temp_500_C', label: '500mb Temperature', min: -80, max: 20, step: 0.1, unit: '°C' },
        { key: 'cloud_top_temp_C', label: 'Cloud Top Temperature', min: -80, max: 10, step: 0.1, unit: '°C' }
      ]
    },
    {
      title: "Key Indices",
      params: [
        { key: 'CAPE_Jkg', label: 'CAPE', min: 0, max: 6000, step: 10, unit: 'J/kg' },
        { key: 'Lifted_Index_C', label: 'Lifted Index', min: -15, max: 15, step: 0.1, unit: '°C' },
        { key: 'rh_2m_pct', label: 'Relative Humidity', min: 0, max: 100, step: 1, unit: '%' },
        { key: 'pressure_sfc_hPa', label: 'Surface Pressure', min: 950, max: 1050, step: 0.1, unit: 'hPa' },
        { key: 'precipitable_water_mm', label: 'Precipitable Water', min: 0, max: 80, step: 0.1, unit: 'mm' },
        { key: 'cloud_cover_frac', label: 'Cloud Cover', min: 0, max: 1, step: 0.01, unit: '' },
        { key: 'K_index', label: 'K Index', min: 0, max: 50, step: 0.1, unit: '' }
      ]
    }
  ];

  return (
    <div className={`${panelClasses} bg-black/30 backdrop-blur-sm border-r border-white/10 p-4 overflow-y-auto`}>
      {/* Brand Header */}
      <div className="mb-5 flex items-center gap-3">
        <img
          src="/logo/logo.png"
          alt="Thundercast"
          className="w-9 h-9 rounded-md shadow-sm ring-1 ring-white/10 object-cover"
        />
        <div>
          <div className="text-white font-semibold tracking-wide">Thundercast</div>
          <div className="text-[11px] text-gray-400 -mt-0.5">AI Weather Intelligence</div>
        </div>
      </div>

      {/* Layers Section */}
      <div className="mb-6">
        <h2 className="text-white text-lg font-semibold mb-2">Active Layers</h2>
        <div className="space-y-2">
          {Object.entries({
            wind: { icon: Wind, label: 'Wind Vectors', color: 'text-blue-300' },
            radar: { icon: Radar, label: 'Weather Radar', color: 'text-green-300' },
            clouds: { icon: Cloud, label: 'Cloud Cover', color: 'text-gray-300' },
            temperature: { icon: Thermometer, label: 'Temperature', color: 'text-red-300' }
          }).map(([key, { icon: Icon, label, color }]) => (
            <div
              key={key}
              onClick={() => onToggleLayer(key)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                activeLayers[key] 
                  ? 'bg-white/10 border border-white/20' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/8'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${activeLayers[key] ? color : 'text-gray-400'}`} />
                <span className={`text-sm ${activeLayers[key] ? 'text-white' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                activeLayers[key] ? 'bg-blue-400 shadow-lg' : 'bg-gray-600'
              }`} />
            </div>
          ))}
        </div>
      </div>

      {/* ML Parameters Section */}
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowMLParams(!showMLParams)}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-purple-400" />
            <h3 className="text-white font-medium">ML Prediction</h3>
          </div>
          {showMLParams ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>

        {showMLParams && (
          <div className="mt-4 space-y-4">
            {mlParametersConfig.map((group) => (
              <div key={group.title} className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 border-b border-white/10 pb-1">
                  {group.title}
                </h4>
                <div className="space-y-2">
                  {group.params.map((param) => (
                    <div key={param.key} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-gray-400">{param.label}</label>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-white font-mono">
                            {mlParams[param.key]}
                          </span>
                          <span className="text-xs text-gray-500">{param.unit}</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={mlParams[param.key]}
                        onChange={(e) => handleParamChange(param.key, e.target.value)}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Parameter Actions */}
            <div className="flex space-x-2 mt-4">
              <button
                onClick={resetToDefaults}
                className="flex-1 py-2 px-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 text-gray-300 rounded text-xs font-medium transition-colors"
              >
                Reset Defaults
              </button>
              <button
                onClick={() => {
                  // Force update parameters
                  if (typeof window.updateMLParameters === 'function') {
                    window.updateMLParameters(mlParams);
                  }
                }}
                className="flex-1 py-2 px-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-300 rounded text-xs font-medium transition-colors"
              >
                Update Prediction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayerPanel;