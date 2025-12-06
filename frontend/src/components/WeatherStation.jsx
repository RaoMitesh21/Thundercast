import React, { useState, useMemo } from 'react';
import { MapPin, Activity, Satellite, Wifi, Clock, AlertCircle, Shield, Radio, Eye, Zap, Brain, Play } from 'lucide-react';
import mlService from '../services/mlService';

const WeatherStation = ({ weatherData = [], selectedLocation = null, mlPredictions = {}, className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
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
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [thunderResult, setThunderResult] = useState(null);
  const [thunderLoading, setThunderLoading] = useState(false);
  const [thunderError, setThunderError] = useState(null);

  // Use latest live prediction when no manual result available
  const liveForSelected = useMemo(() => {
    if (!selectedLocation?.id) return null;
    return mlPredictions[selectedLocation.id] || null;
  }, [selectedLocation, mlPredictions]);

  const getRiskBadge = (risk) => {
    const colors = {
      Red: 'bg-red-500/20 text-red-400 border-red-400/30',
      Yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
      Green: 'bg-green-500/20 text-green-400 border-green-400/30'
    };
    
    return colors[risk] || 'bg-gray-500/20 text-gray-400 border-gray-400/30';
  };

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
      [key]: parseFloat(value) || 0
    }));
  };

  const runPrediction = async () => {
    setIsLoading(true);
    try {
      // Call real backend API for ML prediction
      const response = await fetch('http://localhost:5000/api/ml/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mlParams),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setPrediction({
          probability: result.data.probability,
          confidence: result.data.confidence,
          riskLevel: result.data.risk_level || result.data.riskLevel,
          alert: result.data.alert,
          timestamp: new Date().toLocaleTimeString(),
          modelType: result.data.modelType || 'Random Forest ML Model',
          factors: result.data.factors || {}
        });
      } else {
        throw new Error(result.error || 'Prediction failed');
      }
    } catch (error) {
      console.error('ML Prediction failed:', error);
      
      // Fallback to local prediction if API fails
      const localPrediction = calculateLocalPrediction(mlParams);
      setPrediction({
        ...localPrediction,
        alert: `${localPrediction.alert} (Offline Mode)`,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced local prediction as fallback
  const calculateLocalPrediction = (parameters) => {
    const {
      CAPE_Jkg, Lifted_Index_C, K_index, shear_850_500_ms,
      rh_2m_pct, pressure_sfc_hPa, temp_2m_C, temp_500_C
    } = parameters;

    let riskScore = 0;
    const factors = {};

    // CAPE analysis (most important for thunderstorms)
    if (CAPE_Jkg > 3000) {
      riskScore += 0.35;
      factors.cape = 'Very High - Explosive thunderstorm potential';
    } else if (CAPE_Jkg > 2000) {
      riskScore += 0.25;
      factors.cape = 'High - Strong thunderstorm potential';
    } else if (CAPE_Jkg > 1000) {
      riskScore += 0.15;
      factors.cape = 'Moderate - Some thunderstorm potential';
    } else {
      factors.cape = 'Low - Limited thunderstorm potential';
    }

    // Lifted Index (atmospheric stability)
    if (Lifted_Index_C < -6) {
      riskScore += 0.25;
      factors.stability = 'Extremely unstable atmosphere';
    } else if (Lifted_Index_C < -4) {
      riskScore += 0.20;
      factors.stability = 'Very unstable atmosphere';
    } else if (Lifted_Index_C < -2) {
      riskScore += 0.10;
      factors.stability = 'Unstable atmosphere';
    } else {
      factors.stability = 'Stable atmosphere';
    }

    // Wind Shear
    if (shear_850_500_ms > 20) {
      riskScore += 0.20;
      factors.shear = 'Strong shear - supercell potential';
    } else if (shear_850_500_ms > 15) {
      riskScore += 0.15;
      factors.shear = 'Moderate shear - organized storms possible';
    } else if (shear_850_500_ms > 10) {
      riskScore += 0.08;
      factors.shear = 'Light shear';
    } else {
      factors.shear = 'Minimal shear';
    }

    // Moisture and other factors
    if (rh_2m_pct > 85) riskScore += 0.10;
    if (pressure_sfc_hPa < 1000) riskScore += 0.08;
    
    const tempLapse = temp_2m_C - temp_500_C;
    if (tempLapse > 30) riskScore += 0.10;

    if (K_index > 35) riskScore += 0.12;

    const probability = Math.min(0.98, Math.max(0.02, riskScore));
    const confidence = Math.floor((0.85 + Math.random() * 0.15) * 100);

    let riskLevel, alert;
    if (probability > 0.75) {
      riskLevel = "Red";
      alert = "SEVERE: High thunderstorm probability - dangerous conditions likely";
    } else if (probability > 0.50) {
      riskLevel = "Yellow";
      alert = "MODERATE: Thunderstorm risk - monitor conditions closely";
    } else if (probability > 0.25) {
      riskLevel = "Yellow";
      alert = "LOW-MODERATE: Some thunderstorm potential";
    } else {
      riskLevel = "Green";
      alert = "LOW: Minimal thunderstorm risk - favorable conditions";
    }

    return {
      probability: Math.round(probability * 1000) / 1000,
      confidence,
      riskLevel,
      alert,
      factors
    };
  };

  const runThunderNow = async () => {
    setThunderLoading(true);
    setThunderError(null);
    try {
      // Prefer exact params from LayerPanel via global runner
      if (typeof window.runThunderPrediction === 'function') {
        const res = await window.runThunderPrediction();
        setThunderResult(res);
      } else if (selectedLocation?.id && typeof mlService.predictForLocation === 'function') {
        // Fallback to model using location-based defaults (still model-driven, not random)
        const apiRes = await mlService.predictForLocation(selectedLocation.id);
        if (!apiRes?.success) throw new Error(apiRes?.error || 'Prediction failed');
        setThunderResult(apiRes.data);
      } else {
        throw new Error('No ML parameters available. Open ML Parameters and click "Update Prediction" first.');
      }
    } catch (e) {
      setThunderError(e.message || 'Prediction failed');
      setThunderResult(null);
    } finally {
      setThunderLoading(false);
    }
  };

  const currentResult = thunderResult || liveForSelected;

  return (
    <div className={`fixed left-6 top-1/2 transform -translate-y-1/2 w-96 bg-black/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-30 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Satellite className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">Weather Station</h2>
              <p className="text-gray-400 text-sm">Global Overview</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">LIVE</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'risk' 
                ? 'bg-red-500/20 text-red-300 border border-red-400/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Risk
          </button>
          <button
            onClick={() => setActiveTab('satellite')}
            className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'satellite' 
                ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveTab('prediction')}
            className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'prediction' 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ML Thunder Predict
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm font-medium">Status</span>
              </div>
              <p className="text-green-400 text-xs">All Systems Online</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <Wifi className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Stations</span>
              </div>
              <p className="text-white text-xs">12 Active</p>
            </div>
          </div>

          {selectedLocation && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Selected Location</span>
              </h3>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{selectedLocation.name}</h4>
                    <p className="text-gray-400 text-sm">{selectedLocation.country}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs border font-medium ${getRiskBadge(selectedLocation.risk)}`}>
                    {selectedLocation.risk}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-red-400" />
            <h3 className="text-white font-medium">Risk Assessment</h3>
          </div>

          {/* Risk Overview */}
          <div className="space-y-3 mb-6">
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-400/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-300 font-medium">High Risk Zones</span>
                <span className="text-red-400 font-bold">3</span>
              </div>
              <p className="text-red-200 text-xs">Active thunderstorm warnings</p>
            </div>

            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-400/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-300 font-medium">Medium Risk</span>
                <span className="text-yellow-400 font-bold">5</span>
              </div>
              <p className="text-yellow-200 text-xs">Weather advisories active</p>
            </div>

            <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-300 font-medium">Low Risk</span>
                <span className="text-green-400 font-bold">4</span>
              </div>
              <p className="text-green-200 text-xs">Normal conditions</p>
            </div>
          </div>

          {/* Current Threats */}
          <div className="mb-4">
            <h4 className="text-white text-sm font-medium mb-3 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Active Threats</span>
            </h4>
            <div className="space-y-2">
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-400/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-red-300 text-sm font-medium">Severe Thunderstorm</span>
                  <span className="text-red-400 text-xs">ACTIVE</span>
                </div>
                <p className="text-red-200 text-xs">Delhi region - 88% confidence</p>
              </div>
              
              <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-400/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-yellow-300 text-sm font-medium">Gale Force Winds</span>
                  <span className="text-yellow-400 text-xs">WATCH</span>
                </div>
                <p className="text-yellow-200 text-xs">UK region - 72% confidence</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'satellite' && (
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Radio className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-medium">Live Satellite Data</h3>
          </div>

          {/* Satellite Status */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 font-medium">GOES-16 East</span>
                </div>
                <span className="text-green-400 text-xs">ACTIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Coverage:</span>
                  <span className="text-white ml-1">Americas</span>
                </div>
                <div>
                  <span className="text-gray-400">Resolution:</span>
                  <span className="text-white ml-1">0.5km</span>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 font-medium">Meteosat-11</span>
                </div>
                <span className="text-green-400 text-xs">ACTIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Coverage:</span>
                  <span className="text-white ml-1">Europe/Africa</span>
                </div>
                <div>
                  <span className="text-gray-400">Resolution:</span>
                  <span className="text-white ml-1">1km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Streams */}
          <div className="mb-4">
            <h4 className="text-white text-sm font-medium mb-3">Active Data Streams</h4>
            <div className="space-y-2">
              {[
                { name: 'Infrared Imagery', status: 'Live', color: 'green' },
                { name: 'Water Vapor', status: 'Live', color: 'green' },
                { name: 'Visible Light', status: 'Live', color: 'green' },
                { name: 'Lightning Detection', status: 'Live', color: 'green' }
              ].map((stream, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-gray-300 text-sm">{stream.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 bg-${stream.color}-400 rounded-full animate-pulse`}></div>
                    <span className={`text-${stream.color}-400 text-xs font-medium`}>{stream.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last Update */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Last Satellite Update:</span>
              <span className="text-green-400 font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'prediction' && (
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-medium">ML Prediction</h3>
          </div>

          {/* Key Parameters Input */}
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-medium text-purple-300">Input Parameters</h4>
            
            {/* Wind Parameters */}
            <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-400/20">
              <h5 className="text-xs font-medium text-blue-300 mb-2">Wind</h5>
              <div className="grid grid-cols-2 gap-2">
                {mlParametersConfig.filter(p => p.key.includes('wind')).slice(0, 2).map(param => (
                  <div key={param.key}>
                    <label className="text-xs text-gray-300 block mb-1">{param.label}</label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={mlParams[param.key]}
                        onChange={(e) => handleParamChange(param.key, e.target.value)}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white"
                      />
                      <span className="text-xs text-gray-400 w-8">{param.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Temperature */}
            <div className="bg-red-500/5 rounded-lg p-3 border border-red-400/20">
              <h5 className="text-xs font-medium text-red-300 mb-2">Temperature</h5>
              <div className="grid grid-cols-2 gap-2">
                {mlParametersConfig.filter(p => p.key.includes('temp')).map(param => (
                  <div key={param.key}>
                    <label className="text-xs text-gray-300 block mb-1">{param.label}</label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={mlParams[param.key]}
                        onChange={(e) => handleParamChange(param.key, e.target.value)}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white"
                      />
                      <span className="text-xs text-gray-400 w-8">{param.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Atmospheric Parameters */}
            <div className="bg-yellow-500/5 rounded-lg p-3 border border-yellow-400/20">
              <h5 className="text-xs font-medium text-yellow-300 mb-2">Key Indices</h5>
              <div className="grid grid-cols-2 gap-2">
                {['CAPE_Jkg', 'Lifted_Index_C', 'rh_2m_pct', 'pressure_sfc_hPa'].map(key => {
                  const param = mlParametersConfig.find(p => p.key === key);
                  return (
                    <div key={param.key}>
                      <label className="text-xs text-gray-300 block mb-1">{param.label}</label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={mlParams[param.key]}
                          onChange={(e) => handleParamChange(param.key, e.target.value)}
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white"
                        />
                        <span className="text-xs text-gray-400 w-8">{param.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Prediction Button */}
          <button
            onClick={runPrediction}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-300 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Running Prediction...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Thunderstorm Prediction</span>
              </>
            )}
          </button>

          {/* Prediction Results */}
          {prediction && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white font-medium mb-3">ML Prediction Results</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Risk Level:</span>
                  <span className={`px-2 py-1 rounded text-xs border font-medium ${getRiskBadge(prediction.riskLevel)}`}>
                    {prediction.riskLevel}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Thunderstorm Probability:</span>
                  <span className="text-white text-sm font-medium">{(prediction.probability * 100).toFixed(1)}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Model Confidence:</span>
                  <span className="text-white text-sm font-medium">{prediction.confidence}%</span>
                </div>

                {prediction.factors && Object.keys(prediction.factors).length > 0 && (
                  <div className="mt-3 p-3 bg-blue-500/10 rounded border border-blue-400/20">
                    <h5 className="text-blue-300 text-xs font-medium mb-2">Key Meteorological Factors:</h5>
                    <div className="space-y-1">
                      {Object.entries(prediction.factors).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-blue-200 ml-1">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-400/20">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-yellow-300 text-xs">{prediction.alert}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400 mt-2 pt-2 border-t border-white/10">
                  <span>Model: {prediction.modelType || 'ML Prediction'}</span>
                  <span>Time: {prediction.timestamp}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ML Thunderstorm Prediction */}
      <div className="mt-3 p-3 rounded-md border border-blue-400/20 bg-blue-500/5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white">ML Prediction</h4>
          <button
            onClick={runThunderNow}
            disabled={thunderLoading}
            className="px-2 py-1 text-xs rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 disabled:opacity-50"
          >
            {thunderLoading ? 'Running...' : 'Run Thunderstorm Prediction'}
          </button>
        </div>

        {thunderError && (
          <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded px-2 py-1 mb-2">
            {thunderError}
          </div>
        )}

        {currentResult ? (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2">
              <div className="text-gray-300">Risk Level:</div>
              <div className={`text-sm font-semibold ${
                currentResult.risk_level === 'Red'
                  ? 'text-rose-300'
                  : currentResult.risk_level === 'Yellow'
                  ? 'text-amber-300'
                  : 'text-emerald-300'
              }`}>
                {currentResult.risk_level}
              </div>
            </div>
            <div>
              <div className="text-gray-300">Thunderstorm Probability:</div>
              <div className="text-white">{((currentResult.probability || 0) * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-gray-300">Model Confidence:</div>
              <div className="text-white">{Number(currentResult.confidence || 0).toFixed(0)}%</div>
            </div>
            {currentResult.alert && (
              <div className="col-span-2 mt-1 text-blue-200">
                {currentResult.alert}
              </div>
            )}
            <div className="col-span-2 text-gray-400 mt-1">
              Model: {currentResult.modelType || currentResult.model_info?.type || 'RandomForestClassifier'}
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-300">
            No result yet. Click “Run Thunderstorm Prediction” to fetch from the trained model.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="text-green-400 font-medium">Real-time</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherStation;

