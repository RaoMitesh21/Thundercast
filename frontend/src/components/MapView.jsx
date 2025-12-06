import React, { useRef, useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { airfieldLocations } from '../data/mockData';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ isPlaying, activeLayers, onLocationSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const weatherLayersRef = useRef([]);
  const markersRef = useRef([]);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [, setSelectedLocation] = useState(null);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Red': return '#ef4444';
      case 'Yellow': return '#f59e0b';
      case 'Green': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Weather layer animation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 100);
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Add weather overlay layers with enhanced effects
  const addWeatherLayers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing weather layers
    weatherLayersRef.current.forEach(layer => {
      map.removeLayer(layer);
    });
    weatherLayersRef.current = [];

    // Add weather layers based on active layers
    activeLayers.forEach(layer => {
      if (layer.active) {
        let tileLayer = null;
        const animatedOpacity = 0.4 + (Math.sin(animationFrame * 0.15) * 0.2);

        switch (layer.id) {
          case 'wind':
            // Enhanced wind visualization with animation
            tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
              opacity: isPlaying ? animatedOpacity : 0.3,
              attribution: 'Wind Layer',
              className: 'wind-layer'
            });
            break;
          case 'clouds':
            tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
              opacity: 0.25,
              attribution: 'Clouds Layer',
              className: 'clouds-layer'
            });
            break;
          case 'radar':
            tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
              opacity: isPlaying ? 0.4 + (Math.sin(animationFrame * 0.2) * 0.2) : 0.3,
              attribution: 'Radar Layer',
              className: 'radar-layer'
            });
            break;
          case 'temperature':
            tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
              opacity: 0.2,
              attribution: 'Temperature Layer',
              className: 'temperature-layer'
            });
            break;
          default:
            break;
        }

        if (tileLayer) {
          tileLayer.addTo(map);
          weatherLayersRef.current.push(tileLayer);
        }
      }
    });
  }, [activeLayers, animationFrame, isPlaying]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const createCustomIcon = (location, isSelected = false) => {
      const pulseClass = isPlaying ? 'animate-pulse' : '';
      const scaleClass = isSelected ? 'scale-125' : 'hover:scale-110';
      
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative transform transition-all duration-300 ${scaleClass}">
            <div style="
              width: 36px; 
              height: 36px; 
              border-radius: 50%; 
              border: 4px solid white; 
              box-shadow: 0 8px 25px rgba(0,0,0,0.6), 0 0 20px rgba(255,255,255,0.1); 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: bold; 
              font-size: 16px; 
              background-color: ${getRiskColor(location.risk)};
              ${isPlaying ? 'animation: pulse 2s infinite;' : ''}
            " class="${pulseClass}">
              ✈️
            </div>
            ${isSelected ? `
              <div class="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full border-2 border-blue-500 animate-bounce"></div>
            ` : ''}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
    };

    // Initialize map with enhanced Zoom Earth-style theme
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true
    }).setView([25.0, 0.0], 3);
    
    mapInstanceRef.current = map;

    // Add premium dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(map);

    // Add custom zoom control
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Add airfield markers with enhanced popups
    airfieldLocations.forEach(location => {
      const marker = L.marker([location.lat, location.lng], {
        icon: createCustomIcon(location, false)
      }).addTo(map);

      marker.bindPopup(`
        <div style="
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%); 
          color: white; 
          padding: 16px; 
          border-radius: 12px; 
          border: 1px solid rgba(255,255,255,0.1); 
          min-width: 280px;
          backdrop-filter: blur(10px);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
        ">
          <h3 style="font-weight: bold; font-size: 18px; margin: 0 0 12px 0; display: flex; align-items: center;">
            ✈️ ${location.name}
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
            <div style="color: #9ca3af;">Country:</div>
            <div style="font-weight: 600;">${location.country}</div>
            <div style="color: #9ca3af;">Status:</div>
            <div style="font-weight: 600;">${location.status}</div>
            <div style="color: #9ca3af;">Conditions:</div>
            <div style="font-weight: 600;">${location.conditions || 'Clear'}</div>
          </div>
          <div style="
            display: flex; 
            align-items: center; 
            margin-top: 12px; 
            padding-top: 12px; 
            border-top: 1px solid rgba(255,255,255,0.1);
          ">
            <div style="
              width: 16px; 
              height: 16px; 
              border-radius: 50%; 
              background-color: ${getRiskColor(location.risk)}; 
              margin-right: 8px;
              box-shadow: 0 0 10px ${getRiskColor(location.risk)}50;
            "></div>
            <span style="font-size: 14px; font-weight: 700; color: ${getRiskColor(location.risk)};">
              ${location.risk.toUpperCase()} RISK
            </span>
          </div>
        </div>
      `, {
        maxWidth: 300,
        className: 'premium-popup'
      });

      marker.on('click', () => {
        setSelectedLocation(location);
        onLocationSelect(location);
        
        // Update marker icon to show selection
        marker.setIcon(createCustomIcon(location, true));
        
        // Reset other markers
        markersRef.current.forEach(m => {
          if (m !== marker) {
            const loc = airfieldLocations.find(l => l.lat === m.getLatLng().lat);
            if (loc) m.setIcon(createCustomIcon(loc, false));
          }
        });
      });

      markersRef.current.push(marker);

      // Add risk zone circle
      L.circle([location.lat, location.lng], {
        color: getRiskColor(location.risk),
        fillColor: getRiskColor(location.risk),
        fillOpacity: 0.1,
        weight: 2,
        opacity: 0.5,
        radius: location.risk === 'Red' ? 100000 : location.risk === 'Yellow' ? 75000 : 50000
      }).addTo(map);
    });

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [onLocationSelect]);

  // Update weather layers when activeLayers or animation changes
  useEffect(() => {
    addWeatherLayers();
  }, [addWeatherLayers]);

  return (
    <div className="h-full w-full relative">
      <div 
        ref={mapRef} 
        className="h-full w-full"
        style={{
          background: 'radial-gradient(circle at center, #0f1419 0%, #000000 100%)'
        }}
      />
      
      {/* Enhanced Map Branding */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/90 backdrop-blur-xl text-white px-4 py-3 rounded-xl text-sm font-bold border border-gray-700/50 shadow-2xl">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span>🌍 Airfield Weather Monitor</span>
          </div>
        </div>
      </div>

      {/* Enhanced Live Indicator */}
      {isPlaying && (
        <div className="absolute bottom-24 left-4 z-10">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 backdrop-blur-xl text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center space-x-3 shadow-2xl border border-green-400/30">
            <div className="relative">
              <div className="w-3 h-3 bg-green-300 rounded-full animate-ping absolute"></div>
              <div className="w-3 h-3 bg-green-100 rounded-full"></div>
            </div>
            <span>🔴 LIVE Weather Data</span>
          </div>
        </div>
      )}

      {/* Weather Layer Legend */}
      {activeLayers.some(layer => layer.active) && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/90 backdrop-blur-xl text-white p-4 rounded-xl border border-gray-700/50 shadow-2xl max-w-xs">
            <h3 className="font-bold text-sm mb-2 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Active Layers
            </h3>
            <div className="space-y-1">
              {activeLayers.filter(layer => layer.active).map(layer => (
                <div key={layer.id} className="flex items-center text-xs">
                  <div className={`w-3 h-1 mr-2 rounded-full ${
                    layer.id === 'wind' ? 'bg-blue-400' :
                    layer.id === 'clouds' ? 'bg-gray-400' :
                    layer.id === 'radar' ? 'bg-green-400' :
                    'bg-orange-400'
                  }`}></div>
                  <span className="capitalize">{layer.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .premium-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        
        .premium-popup .leaflet-popup-tip {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
        }
        
        .custom-marker {
          background: none !important;
          border: none !important;
        }

        .wind-layer {
          mix-blend-mode: overlay;
        }
        
        .clouds-layer {
          mix-blend-mode: soft-light;
        }
        
        .radar-layer {
          mix-blend-mode: multiply;
        }
        
        .temperature-layer {
          mix-blend-mode: color;
        }
      `}</style>
    </div>
  );
};

export default MapView;
