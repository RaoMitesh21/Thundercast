// import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
// import Globe from 'react-globe.gl';
// import { airfieldLocations, generateWindVectors } from '../data/mockData';

// const GlobeView = ({ 
//   isPlaying = false, 
//   activeLayers = {}, 
//   weatherData = {}, 
//   onLocationSelect, 
//   onMarkerClick, 
//   selectedLocation 
// }) => {
//   const globeEl = useRef();
//   const [countries, setCountries] = useState({ features: [] });
//   const [isGlobeReady, setIsGlobeReady] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [windData, setWindData] = useState([]);

//   // Memoize validated airfield data to prevent unnecessary re-renders
//   const validAirfieldData = useMemo(() => {
//     if (!Array.isArray(airfieldLocations)) return [];
    
//     return airfieldLocations.filter(item => 
//       item && 
//       typeof item.lat === 'number' && 
//       typeof item.lng === 'number' && 
//       !isNaN(item.lat) && 
//       !isNaN(item.lng) &&
//       item.lat >= -90 && item.lat <= 90 &&
//       item.lng >= -180 && item.lng <= 180
//     );
//   }, []);

//   // Load world countries GeoJSON
//   useEffect(() => {
//     let isMounted = true;
    
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 10000);

//     fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson', {
//       signal: controller.signal
//     })
//       .then(res => {
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         return res.json();
//       })
//       .then(data => {
//         if (isMounted && data && Array.isArray(data.features)) {
//           setCountries(data);
//         }
//       })
//       .catch(error => {
//         if (error.name !== 'AbortError' && isMounted) {
//           console.warn('Failed to load world map data:', error);
//           setCountries({ features: [] });
//         }
//       })
//       .finally(() => {
//         clearTimeout(timeoutId);
//         if (isMounted) {
//           setIsLoading(false);
//         }
//       });

//     return () => {
//       isMounted = false;
//       controller.abort();
//       clearTimeout(timeoutId);
//     };
//   }, []);

//   // Handle globe auto-rotation
//   useEffect(() => {
//     if (globeEl.current && isGlobeReady) {
//       try {
//         const controls = globeEl.current.controls();
//         if (controls) {
//           controls.autoRotate = isPlaying;
//           controls.autoRotateSpeed = isPlaying ? 0.5 : 0;
//         }
//       } catch (error) {
//         console.warn('Error updating globe controls:', error);
//       }
//     }
//   }, [isPlaying, isGlobeReady]);

//   // Generate wind vectors when wind layer is active
//   useEffect(() => {
//     if (activeLayers.wind && typeof generateWindVectors === 'function') {
//       try {
//         const vectors = generateWindVectors();
//         setWindData(vectors || []);
//       } catch (error) {
//         console.warn('Error generating wind vectors:', error);
//         setWindData([]);
//       }
//     } else {
//       setWindData([]);
//     }
//   }, [activeLayers.wind]);

//   const handleMarkerClick = useCallback((marker, event) => {
//     if (!marker) return;
    
//     try {
//       if (event) {
//         event.stopPropagation();
//       }
      
//       if (onMarkerClick) {
//         onMarkerClick(marker);
//       }
      
//       if (onLocationSelect) {
//         onLocationSelect(marker);
//       }
      
//       // Safely update point of view
//       if (globeEl.current && typeof globeEl.current.pointOfView === 'function') {
//         globeEl.current.pointOfView({
//           lat: marker.lat,
//           lng: marker.lng,
//           altitude: 1.5
//         }, 1000);
//       }
//     } catch (error) {
//       console.warn('Error handling marker click:', error);
//     }
//   }, [onMarkerClick, onLocationSelect]);

//   const getRiskColor = useCallback((risk) => {
//     const colors = {
//       'Red': '#ef4444',
//       'Yellow': '#eab308',
//       'Green': '#22c55e'
//     };
//     return colors[risk] || '#64748b';
//   }, []);

//   const handleGlobeReady = useCallback(() => {
//     console.log('Globe is ready');
//     setIsGlobeReady(true);
//   }, []);

//   const getPointLabel = useCallback((d) => {
//     if (!d) return '';
    
//     return `
//       <div style="
//         background: rgba(0, 0, 0, 0.8);
//         color: white;
//         padding: 12px;
//         border-radius: 8px;
//         border: 1px solid rgba(255, 255, 255, 0.2);
//         backdrop-filter: blur(8px);
//         max-width: 200px;
//         font-family: Inter, sans-serif;
//       ">
//         <div style="font-weight: 600; margin-bottom: 4px;">
//           ${d.name || 'Unknown Location'}
//         </div>
//         <div style="font-size: 12px; color: #d1d5db; margin-bottom: 8px;">
//           ${d.country || 'Unknown Country'}
//         </div>
//         <div style="margin-bottom: 8px;">
//           <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
//             <span style="
//               width: 12px;
//               height: 12px;
//               border-radius: 50%;
//               background-color: ${getRiskColor(d.risk)};
//               display: inline-block;
//             "></span>
//             <span>${d.status || 'Unknown'}</span>
//           </div>
//           <div style="font-size: 11px;">
//             Confidence: ${d.confidence || 0}%
//           </div>
//         </div>
//         <div style="
//           font-size: 11px;
//           color: #fcd34d;
//           padding: 4px 0;
//         ">
//           ${d.alert || 'No alerts'}
//         </div>
//       </div>
//     `;
//   }, [getRiskColor]);

//   const createWindVectors = useCallback(() => {
//     if (!activeLayers.wind || !weatherData || !globeEl.current) return;

//     try {
//       console.log('Wind vectors would be created here with validated data');
//       // Implementation using react-globe.gl built-in systems
//     } catch (error) {
//       console.error('Error creating wind vectors:', error);
//     }
//   }, [activeLayers.wind, weatherData]);

//   const createTemperatureVisualization = useCallback(() => {
//     if (!activeLayers.temperature || !weatherData || !globeEl.current) return;

//     try {
//       console.log('Temperature visualization would be created here with validated data');
//       // Implementation using react-globe.gl built-in systems
//     } catch (error) {
//       console.error('Error creating temperature visualization:', error);
//     }
//   }, [activeLayers.temperature, weatherData]);

//   // Enhanced error boundary for operations
//   const safeOperation = (operation, operationName) => {
//     try {
//       return operation();
//     } catch (error) {
//       console.error(`Operation failed (${operationName}):`, error);
//       return null;
//     }
//   };

//   // Update effects with error handling
//   useEffect(() => {
//     if (activeLayers.wind) {
//       safeOperation(() => createWindVectors(), 'createWindVectors');
//     }
//   }, [createWindVectors, activeLayers.wind]);

//   useEffect(() => {
//     if (activeLayers.temperature) {
//       safeOperation(() => createTemperatureVisualization(), 'createTemperatureVisualization');
//     }
//   }, [createTemperatureVisualization, activeLayers.temperature]);

//   // Simplified cleanup
//   useEffect(() => {
//     const cleanup = () => {
//       if (globeEl.current && globeEl.current.scene) {
//         try {
//           const scene = globeEl.current.scene();
//           if (scene && scene.children) {
//             console.log('Cleanup would happen here if custom objects were added');
//           }
//         } catch (error) {
//           console.warn('Error during cleanup:', error);
//         }
//       }
//     };

//     const interval = setInterval(cleanup, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   if (isLoading) {
//     return (
//       <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
//         <div className="text-white text-lg">Loading globe...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full relative">
//       <Globe
//         ref={globeEl}
//         key="weather-globe"
        
//         // Globe textures
//         globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
//         bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
//         // Event handlers
//         onGlobeReady={handleGlobeReady}
        
//         // Countries data with safe fallback
//         polygonsData={countries.features || []}
//         polygonAltitude={0.01}
//         polygonCapColor={() => 'rgba(200, 0, 0, 0.05)'}
//         polygonSideColor={() => 'rgba(0, 100, 0, 0.02)'}
//         polygonStrokeColor={() => 'rgba(255, 255, 255, 0.3)'}
//         polygonStrokeWidth={0.2}
        
//         // Airfield markers
//         pointsData={validAirfieldData}
//         pointAltitude={0.02}
//         pointRadius={0.6}
//         pointColor={d => getRiskColor(d?.risk)}
//         pointLabel={getPointLabel}
//         onPointClick={handleMarkerClick}
//         pointsMerge={false}
        
//         // Wind vectors (only show if wind layer is active)
//         arcsData={activeLayers.wind ? windData : []}
//         arcColor={() => 'rgba(59, 130, 246, 0.6)'}
//         arcAltitude={0.1}
//         arcStroke={2}
//         arcDashLength={0.4}
//         arcDashGap={0.2}
//         arcDashAnimateTime={2000}
        
//         // Atmosphere
//         atmosphereColor="#3b82f6"
//         atmosphereAltitude={0.15}
        
//         // Controls
//         enablePointerInteraction={true}
        
//         // Performance optimizations
//         rendererConfig={{
//           antialias: false,
//           alpha: true,
//           powerPreference: "high-performance"
//         }}
        
//         // Animation
//         animateIn={false}
//       />
      
//       {/* Layer indicators */}
//       <div className="absolute top-4 left-4 space-y-2">
//         {activeLayers.wind && (
//           <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded text-sm backdrop-blur-sm border border-blue-400/30">
//             Wind Layer Active
//           </div>
//         )}
//         {activeLayers.radar && (
//           <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded text-sm backdrop-blur-sm border border-green-400/30">
//             Radar Layer Active
//           </div>
//         )}
//         {activeLayers.clouds && (
//           <div className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded text-sm backdrop-blur-sm border border-gray-400/30">
//             Clouds Layer Active
//           </div>
//         )}
//         {activeLayers.temperature && (
//           <div className="bg-red-500/20 text-red-300 px-3 py-1 rounded text-sm backdrop-blur-sm border border-red-400/30">
//             Temperature Layer Active
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default GlobeView;

// import React, { useRef, useEffect, useState, useCallback } from 'react';
// import Globe from 'react-globe.gl';
// import * as topojson from 'topojson-client'; 
// import * as d3 from 'd3-geo'; // ✅ for centroid
// import { airfieldLocations, generateWindVectors } from '../data/mockData';

// const GlobeView = ({ 
//   isPlaying = false, 
//   activeLayers = {}, 
//   weatherData = {}, 
//   onLocationSelect, 
//   onMarkerClick, 
//   selectedLocation 
// }) => {
//   const globeEl = useRef();
//   const [countries, setCountries] = useState({ features: [] });
//   const [isGlobeReady, setIsGlobeReady] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [windData, setWindData] = useState([]);
//   const [weatherMarkers, setWeatherMarkers] = useState([]); // ✅ weather markers

//   const globeTextureUrl = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
//   const bumpTextureUrl = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
//   const bgTextureUrl   = 'https://unpkg.com/three-globe/example/img/night-sky.png';

//   // ✅ Load country borders
//   useEffect(() => {
//     fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
//       .then(res => res.json())
//       .then(worldData => {
//         const geoJson = topojson.feature(worldData, worldData.objects.countries);
//         setCountries(geoJson);
//         setIsLoading(false);
//       })
//       .catch(err => {
//         console.warn('Failed to load countries', err);
//         setIsLoading(false);
//       });
//   }, []);

//   // ✅ Auto-rotate
//   useEffect(() => {
//     if (globeEl.current && isGlobeReady) {
//       try {
//         const controls = globeEl.current.controls();
//         if (controls) {
//           controls.autoRotate = isPlaying;
//           controls.autoRotateSpeed = isPlaying ? 0.5 : 0;
//         }
//       } catch (error) {
//         console.warn('Error updating globe controls:', error);
//       }
//     }
//   }, [isPlaying, isGlobeReady]);

//   // ✅ Wind vectors
//   useEffect(() => {
//     if (activeLayers.wind && typeof generateWindVectors === 'function') {
//       try {
//         const vectors = generateWindVectors();
//         setWindData(vectors || []);
//       } catch (error) {
//         console.warn('Error generating wind vectors:', error);
//         setWindData([]);
//       }
//     } else {
//       setWindData([]);
//     }
//   }, [activeLayers.wind]);

//   // ✅ Globe Ready
//   const handleGlobeReady = useCallback(() => {
//     setIsGlobeReady(true);
//     if (!globeEl.current) return;

//     try {
//       const renderer = globeEl.current.renderer?.();
//       if (renderer) {
//         const dpr = window.devicePixelRatio || 1;
//         renderer.setPixelRatio(dpr);

//         setTimeout(() => {
//           try {
//             if (typeof globeEl.current.globeMaterial === 'function') {
//               const mat = globeEl.current.globeMaterial();
//               if (mat && mat.map) {
//                 const maxAniso = renderer.capabilities.getMaxAnisotropy?.() || 16;
//                 mat.map.anisotropy = maxAniso;
//                 mat.map.needsUpdate = true;
//               }
//             }
//           } catch (err) {
//             console.warn('Anisotropy setup failed:', err);
//           }
//         }, 50);
//       }
//     } catch (err) {
//       console.warn('Renderer/anisotropy fix failed:', err);
//     }
//   }, []);

//   // ✅ Handle country click → fetch weather
//   const handleCountryClick = async (country) => {
//     try {
//       const centroid = d3.geoCentroid(country);
//       const [lat, lng] = centroid;

//       const apiKey = "bd5e378503939ddaee76f12ad7a97608"; // 🔑 add key
//       const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
//       const res = await fetch(url);
//       const data = await res.json();

//       if (data && data.weather) {
//         const marker = {
//           lat,
//           lng,
//           country: country.properties.name,
//           weather: {
//             temp: data.main.temp,
//             desc: data.weather[0].description,
//           }
//         };
//         setWeatherMarkers([marker]); // overwrite old marker
//       }
//     } catch (err) {
//       console.warn("Weather fetch failed:", err);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
//         <div className="text-white text-lg">Loading globe...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full relative">
//       <Globe
//         ref={globeEl}
//         key="weather-globe"
//         globeImageUrl={globeTextureUrl}
//         bumpImageUrl={bumpTextureUrl}
//         backgroundImageUrl={bgTextureUrl}
//         onGlobeReady={handleGlobeReady}

//         polygonsData={countries.features}
//         polygonCapColor={() => 'rgba(0,0,0,0)'}
//         polygonSideColor={() => 'rgba(0,0,0,0)'}
//         polygonStrokeColor={() => '#999'}
//         polygonLabel={({ properties: d }) => d.name}
//         onPolygonClick={handleCountryClick} // ✅ handle click

//         arcsData={activeLayers.wind ? windData : []}
//         arcColor={() => 'rgba(59, 130, 246, 0.6)'}
//         arcAltitude={0.1}
//         arcStroke={2}
//         arcDashLength={0.4}
//         arcDashGap={0.2}
//         arcDashAnimateTime={2000}
        
//         atmosphereColor="#3b82f6"
//         atmosphereAltitude={0.15}
//         enablePointerInteraction={true}
//         rendererConfig={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
//         animateIn={true}

//         // ✅ Weather Markers
//         htmlElementsData={weatherMarkers}
//         htmlElement={d => {
//           const el = document.createElement('div');
//           el.style.color = 'white';
//           el.style.background = 'rgba(0,0,0,0.6)';
//           el.style.padding = '6px 10px';
//           el.style.borderRadius = '8px';
//           el.style.fontSize = '12px';
//           el.style.pointerEvents = 'none';
//           el.innerHTML = `
//             <b>${d.country}</b><br/>
//             🌡️ ${d.weather.temp}°C<br/>
//             🌥️ ${d.weather.desc}
//           `;
//           return el;
//         }}
//       />

//       {/* ✅ Layer indicators */}
//       <div className="absolute top-4 left-4 space-y-2">
//         {activeLayers.wind && (
//           <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded text-sm backdrop-blur-sm border border-blue-400/30">
//             Wind Layer Active
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default GlobeView;

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Globe from 'react-globe.gl';
import * as topojson from 'topojson-client'; 
import { geoCentroid } from 'd3-geo'; // ✅ Explicit import for centroid
import { airfieldLocations, generateWindVectors } from '../data/mockData';

const GlobeView = ({ 
  isPlaying = false, 
  activeLayers = {}, 
  weatherData = {}, 
  onLocationSelect, 
  onMarkerClick, 
  selectedLocation 
}) => {
  const globeEl = useRef();
  const [countries, setCountries] = useState({ features: [] });
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [windData, setWindData] = useState([]);
  const [weatherMarkers, setWeatherMarkers] = useState([]);

  const globeTextureUrl = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
  const bumpTextureUrl = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
  const bgTextureUrl   = 'https://unpkg.com/three-globe/example/img/night-sky.png';

  // ✅ Load country borders
  useEffect(() => {
    fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(worldData => {
        const geoJson = topojson.feature(worldData, worldData.objects.countries);
        setCountries(geoJson);
        setIsLoading(false);
      })
      .catch(err => {
        console.warn('Failed to load countries', err);
        setIsLoading(false);
      });
  }, []);

  // ✅ Auto-rotate
  useEffect(() => {
    if (globeEl.current && isGlobeReady) {
      try {
        const controls = globeEl.current.controls();
        if (controls) {
          controls.autoRotate = isPlaying;
          controls.autoRotateSpeed = isPlaying ? 0.5 : 0;
        }
      } catch (error) {
        console.warn('Error updating globe controls:', error);
      }
    }
  }, [isPlaying, isGlobeReady]);

  // ✅ Wind vectors
  useEffect(() => {
    if (activeLayers.wind && typeof generateWindVectors === 'function') {
      try {
        const vectors = generateWindVectors();
        setWindData(vectors || []);
      } catch (error) {
        console.warn('Error generating wind vectors:', error);
        setWindData([]);
      }
    } else {
      setWindData([]);
    }
  }, [activeLayers.wind]);

  // ✅ Globe Ready
  const handleGlobeReady = useCallback(() => {
    setIsGlobeReady(true);
    if (!globeEl.current) return;

    try {
      const renderer = globeEl.current.renderer?.();
      if (renderer) {
        const dpr = window.devicePixelRatio || 1;
        renderer.setPixelRatio(dpr);

        setTimeout(() => {
          try {
            if (typeof globeEl.current.globeMaterial === 'function') {
              const mat = globeEl.current.globeMaterial();
              if (mat && mat.map) {
                const maxAniso = renderer.capabilities.getMaxAnisotropy?.() || 16;
                mat.map.anisotropy = maxAniso;
                mat.map.needsUpdate = true;
              }
            }
          } catch (err) {
            console.warn('Anisotropy setup failed:', err);
          }
        }, 50);
      }
    } catch (err) {
      console.warn('Renderer/anisotropy fix failed:', err);
    }
  }, []);

  // ✅ Handle country click → fetch weather (with new API key)
  const handleCountryClick = async (country) => {
    try {
      const centroid = geoCentroid(country);
      const [lng, lat] = centroid; // ✅ Correct order: [lng, lat]

      const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY || '41830b7bc27a514175a08b6fa1190149'; // ✅ Your new API key
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(`API error: ${data.message || 'Unknown error'}`);
      }

      if (data && data.weather && data.main) {
        const marker = {
          lat,
          lng,
          country: country.properties.name,
          weather: {
            temp: Math.round(data.main.temp),
            desc: data.weather[0].description,
            icon: data.weather[0].icon,
          }
        };
        setWeatherMarkers([marker]);
        console.log('Weather fetched successfully:', marker);
      } else {
        console.warn('Invalid weather data received');
      }
    } catch (err) {
      console.warn('Weather fetch failed:', err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-white text-lg">Loading globe...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Globe
        ref={globeEl}
        key="weather-globe"
        globeImageUrl={globeTextureUrl}
        bumpImageUrl={bumpTextureUrl}
        backgroundImageUrl={bgTextureUrl}
        onGlobeReady={handleGlobeReady}

        polygonsData={countries.features}
        polygonCapColor={() => 'rgba(0,0,0,0)'}
        polygonSideColor={() => 'rgba(0,0,0,0)'}
        polygonStrokeColor={() => '#999'}
        polygonLabel={({ properties: d }) => d.name}
        onPolygonClick={handleCountryClick}

        arcsData={activeLayers.wind ? windData : []}
        arcColor={() => 'rgba(59, 130, 246, 0.6)'}
        arcAltitude={0.1}
        arcStroke={2}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}
        enablePointerInteraction={true}
        rendererConfig={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        animateIn={true}

        htmlElementsData={weatherMarkers}
        htmlElement={d => {
          const el = document.createElement('div');
          el.style.color = 'white';
          el.style.background = 'rgba(0,0,0,0.6)';
          el.style.padding = '6px 10px';
          el.style.borderRadius = '8px';
          el.style.fontSize = '12px';
          el.style.pointerEvents = 'none';
          el.innerHTML = `
            <b>${d.country}</b><br/>
            🌡️ ${d.weather.temp}°C<br/>
            🌥️ ${d.weather.desc}
            ${d.weather.icon ? `<br/><img src="https://openweathermap.org/img/wn/${d.weather.icon}@2x.png" width="16" height="16" alt="Weather icon">` : ''}
          `;
          return el;
        }}
      />

      <div className="absolute top-4 left-4 space-y-2">
        {activeLayers.wind && (
          <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded text-sm backdrop-blur-sm border border-blue-400/30">
            Wind Layer Active
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobeView;