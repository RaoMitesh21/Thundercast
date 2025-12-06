import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

const StatusBar = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [systemStatus] = useState('Operational');

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate occasional connection issues
      if (Math.random() > 0.95) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 3000);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getSystemStatusIcon = () => {
    switch (systemStatus) {
      case 'Operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'Critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-800 text-white px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - System info */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Airfield Weather System</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {getSystemStatusIcon()}
            <span className="text-sm">{systemStatus}</span>
          </div>
        </div>

        {/* Center - Current time */}
        <div className="text-center">
          <div className="text-lg font-mono">
            {lastUpdate.toLocaleTimeString()}
          </div>
          <div className="text-xs text-gray-400">
            {lastUpdate.toLocaleDateString()}
          </div>
        </div>

        {/* Right side - Connection status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-400 animate-pulse" />
                <span className="text-sm text-red-400">Reconnecting...</span>
              </>
            )}
          </div>
          
          <div className="text-sm text-gray-400">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
