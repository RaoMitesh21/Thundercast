import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Zap, Wind, Eye, Thermometer } from 'lucide-react';
import { mockWeatherData, weatherHistory } from '../data/mockData';

const AlertPanel = () => {
  const [currentData] = useState(mockWeatherData);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (currentData.risk === 'Red') {
      const flashInterval = setInterval(() => {
        setShowFlash(prev => !prev);
      }, 1000);
      return () => clearInterval(flashInterval);
    }
  }, [currentData.risk]);

  const getWeatherIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'thunderstorm':
        return <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />;
      case 'rain':
        return <CloudRain className="w-8 h-8 text-blue-400 animate-bounce-slow" />;
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-gray-400" />;
      default:
        return <Wind className="w-8 h-8 text-green-400" />;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Red': return 'bg-red-500 text-white';
      case 'Yellow': return 'bg-yellow-500 text-black';
      case 'Green': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      {/* Header with flashing alert for Red risk */}
      {currentData.risk === 'Red' && (
        <div className={`mb-4 p-3 rounded-lg text-center font-bold ${showFlash ? 'bg-red-600 text-white' : 'bg-red-200 text-red-800'} transition-all duration-300`}>
          ⚠️ CRITICAL ALERT ⚠️
        </div>
      )}

      {/* Weather Status Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Weather Status</h2>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getWeatherIcon(currentData.status)}
            <div>
              <h3 className="text-xl font-semibold">{currentData.status}</h3>
              <p className="text-gray-600">Updated: {new Date(currentData.lastUpdated).toLocaleTimeString()}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold text-sm ${getRiskColor(currentData.risk)}`}>
            {currentData.risk.toUpperCase()}
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600">Temperature</span>
            </div>
            <p className="text-xl font-bold">{currentData.temperature}°C</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">Wind Speed</span>
            </div>
            <p className="text-xl font-bold">{currentData.windSpeed} km/h</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <CloudRain className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Humidity</span>
            </div>
            <p className="text-xl font-bold">{currentData.humidity}%</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">Visibility</span>
            </div>
            <p className="text-xl font-bold">{currentData.visibility} km</p>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Prediction Confidence</h3>
          <span className="text-2xl font-bold">{currentData.confidence}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${getConfidenceColor(currentData.confidence)}`}
            style={{ width: `${currentData.confidence}%` }}
          ></div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          {currentData.confidence >= 80 ? 'High Confidence' : 
           currentData.confidence >= 60 ? 'Medium Confidence' : 'Low Confidence'}
        </div>
      </div>

      {/* Alert Message */}
      <div className={`p-4 rounded-lg border-l-4 ${
        currentData.risk === 'Red' ? 'bg-red-50 border-red-500' :
        currentData.risk === 'Yellow' ? 'bg-yellow-50 border-yellow-500' :
        'bg-green-50 border-green-500'
      }`}>
        <h4 className="font-semibold text-gray-800 mb-2">Current Alert</h4>
        <p className="text-gray-700">{currentData.alert}</p>
      </div>

      {/* Confidence History Mini Chart */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Confidence Trend</h4>
        <div className="flex items-end space-x-1 h-20">
          {weatherHistory.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="bg-blue-500 w-full rounded-t transition-all duration-500 hover:bg-blue-600"
                style={{ height: `${point.confidence}%` }}
              ></div>
              <span className="text-xs text-gray-600 mt-1">{point.time.slice(-2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
