export const weatherData = {
  location: "Global Overview",
  risk: "Green",
  confidence: 85,
  wind: "15 mph NNE",
  temperature: "22°C",
  humidity: "65%",
  visibility: "10 km",
  alert: null
};

export const weatherLayers = [
  { id: 'wind', name: 'Wind Vectors', active: true },
  { id: 'radar', name: 'Weather Radar', active: false },
  { id: 'clouds', name: 'Cloud Cover', active: true },
  { id: 'temperature', name: 'Temperature', active: false }
];

export const airfieldLocations = [
  {
    id: 'delhi',
    name: 'Delhi',
    country: 'India',
    coordinates: { lat: 28.7041, lng: 77.1025 }, // Ensure valid numbers
    risk: 'Red',
    status: 'Severe thunderstorm warning',
    confidence: 88,
    windSpeed: 15.5, // Add valid wind data
    windDirection: 225,
    temperature: 35.2,
    humidity: 78,
    pressure: 995.5,
    alert: 'High CAPE values detected - severe weather imminent'
  },
  {
    id: 'london',
    name: 'London Heathrow',
    country: 'United Kingdom',
    coordinates: { lat: 51.4700, lng: -0.4543 },
    risk: 'Yellow',
    status: 'Weather advisory',
    confidence: 72,
    windSpeed: 22.3,
    windDirection: 280,
    temperature: 18.7,
    humidity: 65,
    pressure: 1008.2,
    alert: 'Moderate wind shear detected'
  },
  {
    id: 3,
    name: "Heathrow Airport",
    country: "UK",
    lat: 51.4700,
    lng: -0.4543,
    status: "Gale Warning",
    confidence: 92,
    risk: "Yellow",
    alert: "Strong winds 45-60 mph"
  },
  {
    id: 4,
    name: "Charles de Gaulle",
    country: "France",
    lat: 49.0097,
    lng: 2.5479,
    status: "Overcast",
    confidence: 78,
    risk: "Yellow",
    alert: "Low visibility conditions"
  },
  {
    id: 5,
    name: "Tokyo Haneda",
    country: "Japan",
    lat: 35.5494,
    lng: 139.7798,
    status: "Clear",
    confidence: 92,
    risk: "Green",
    alert: "No alerts"
  }
];

export const confidenceHistory = [
  { time: "14:00", confidence: 92 },
  { time: "14:15", confidence: 89 },
  { time: "14:30", confidence: 85 }
];

export const windVectors = [
  { lat: 40.7128, lng: -74.0060, speed: 15, direction: 45 },
  { lat: 51.5074, lng: -0.1278, speed: 22, direction: 180 },
  { lat: 35.6762, lng: 139.6503, speed: 8, direction: 270 }
];

// Generate wind vectors function for GlobeView
export const generateWindVectors = () => {
  const vectors = [];
  const locations = [
    { lat: 40.7128, lng: -74.0060 }, // New York
    { lat: 51.5074, lng: -0.1278 },  // London
    { lat: 35.6762, lng: 139.6503 }, // Tokyo
    { lat: 28.6139, lng: 77.2090 },  // Delhi
    { lat: 49.0097, lng: 2.5479 },   // Paris
  ];

  locations.forEach(location => {
    vectors.push({
      lat: location.lat,
      lng: location.lng,
      speed: Math.floor(Math.random() * 30 + 5), // 5-35 mph
      direction: Math.floor(Math.random() * 360), // 0-360 degrees
      intensity: Math.random() * 0.8 + 0.2 // 0.2-1.0
    });
  });

  return vectors;
};

// Add data validation function
export const validateLocationData = (location) => {
  const validatedLocation = { ...location };
  
  // Validate coordinates
  if (!location.coordinates || 
      typeof location.coordinates.lat !== 'number' || 
      isNaN(location.coordinates.lat) ||
      typeof location.coordinates.lng !== 'number' || 
      isNaN(location.coordinates.lng)) {
    console.warn(`Invalid coordinates for location ${location.name}, using defaults`);
    validatedLocation.coordinates = { lat: 0, lng: 0 };
  }
  
  // Validate numeric weather data
  const numericFields = ['windSpeed', 'windDirection', 'temperature', 'humidity', 'pressure', 'confidence'];
  numericFields.forEach(field => {
    if (typeof location[field] !== 'number' || isNaN(location[field])) {
      const defaults = {
        windSpeed: 10,
        windDirection: 0,
        temperature: 20,
        humidity: 50,
        pressure: 1013,
        confidence: 70
      };
      console.warn(`Invalid ${field} for location ${location.name}, using default: ${defaults[field]}`);
      validatedLocation[field] = defaults[field];
    }
  });
  
  return validatedLocation;
};

// Validate all locations
export const validatedAirfieldLocations = airfieldLocations.map(validateLocationData);