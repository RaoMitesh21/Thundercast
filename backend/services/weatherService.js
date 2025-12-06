class WeatherService {
  constructor() {
    this.mockLocations = [
      {
        id: 'delhi',
        name: 'Delhi',
        country: 'India',
        coordinates: { lat: 28.7041, lng: 77.1025 },
        risk: 'Red',
        status: 'Severe thunderstorm warning',
        confidence: 88,
        windSpeed: 15.5,
        windDirection: 225,
        temperature: 35.2,
        humidity: 78,
        pressure: 995.5,
        cape: 3200,
        liftedIndex: -6.5,
        kIndex: 35,
        windShear: 18,
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
        cape: 800,
        liftedIndex: -2.1,
        kIndex: 22,
        windShear: 12,
        alert: 'Moderate wind shear detected'
      },
      {
        id: 'tokyo',
        name: 'Tokyo Narita',
        country: 'Japan',
        coordinates: { lat: 35.7720, lng: 140.3929 },
        risk: 'Green',
        status: 'Normal conditions',
        confidence: 95,
        windSpeed: 8.2,
        windDirection: 120,
        temperature: 24.1,
        humidity: 58,
        pressure: 1015.8,
        cape: 500,
        liftedIndex: 1.2,
        kIndex: 18,
        windShear: 6,
        alert: null
      },
      {
        id: 'singapore',
        name: 'Singapore Changi',
        country: 'Singapore',
        coordinates: { lat: 1.3644, lng: 103.9915 },
        risk: 'Yellow',
        status: 'Thunderstorm watch',
        confidence: 79,
        windSpeed: 12.1,
        windDirection: 200,
        temperature: 31.5,
        humidity: 85,
        pressure: 1009.2,
        cape: 2800,
        liftedIndex: -4.2,
        kIndex: 28,
        windShear: 8,
        alert: 'High humidity and CAPE - thunderstorms possible'
      },
      {
        id: 'newyork',
        name: 'New York JFK',
        country: 'United States',
        coordinates: { lat: 40.6413, lng: -73.7781 },
        risk: 'Green',
        status: 'Clear conditions',
        confidence: 91,
        windSpeed: 18.5,
        windDirection: 270,
        temperature: 22.8,
        humidity: 45,
        pressure: 1018.5,
        cape: 300,
        liftedIndex: 3.1,
        kIndex: 15,
        windShear: 15,
        alert: null
      },
      {
        id: 'sydney',
        name: 'Sydney Kingsford',
        country: 'Australia',
        coordinates: { lat: -33.9399, lng: 151.1753 },
        risk: 'Yellow',
        status: 'Storm development possible',
        confidence: 68,
        windSpeed: 25.2,
        windDirection: 180,
        temperature: 28.9,
        humidity: 72,
        pressure: 1002.1,
        cape: 1800,
        liftedIndex: -3.5,
        kIndex: 31,
        windShear: 20,
        alert: 'Strong wind shear - organized storms possible'
      }
    ];
    
    this.updateInterval = null;
    this.startRealTimeUpdates();
  }

  async getCurrentWeather() {
    return this.mockLocations.map(location => ({
      ...location,
      weather: this.generateRealtimeWeatherData(location),
      thunderstormData: this.generateThunderstormData(location),
      lastUpdated: new Date().toISOString()
    }));
  }

  async getLocationWeather(locationId) {
    const location = this.mockLocations.find(loc => loc.id === locationId);
    if (!location) {
      throw new Error(`Location ${locationId} not found`);
    }

    return {
      ...location,
      weather: this.generateRealtimeWeatherData(location),
      thunderstormData: this.generateThunderstormData(location),
      lastUpdated: new Date().toISOString()
    };
  }

  generateRealtimeWeatherData(location) {
    const baseRisk = location.risk === 'Red' ? 0.8 : location.risk === 'Yellow' ? 0.4 : 0.1;
    const variation = (Math.random() - 0.5) * 0.1;
    
    return {
      temperature: location.temperature + variation * 5,
      humidity: Math.max(20, Math.min(100, location.humidity + variation * 20)),
      pressure: location.pressure + variation * 10,
      windSpeed: Math.max(0, location.windSpeed + variation * 8),
      windDirection: (location.windDirection + variation * 30) % 360,
      visibility: Math.max(1, 15 + variation * 10),
      cloudCover: Math.max(0, Math.min(1, baseRisk + variation * 0.3)),
      precipitation: baseRisk > 0.5 ? Math.random() * 5 : 0
    };
  }

  generateThunderstormData(location) {
    const baseRisk = location.risk === 'Red' ? 0.8 : location.risk === 'Yellow' ? 0.4 : 0.1;
    const variation = (Math.random() - 0.5) * 0.2;
    
    return {
      cape: Math.max(0, location.cape + variation * 1000),
      liftedIndex: location.liftedIndex + variation * 2,
      kIndex: Math.max(0, Math.min(50, location.kIndex + variation * 8)),
      windShear: Math.max(0, location.windShear + variation * 5),
      precipitableWater: Math.floor(Math.random() * 50 + (baseRisk * 30)),
      cloudTopTemp: Math.floor(Math.random() * -20 - (baseRisk * 30)),
      dewPoint: Math.floor(Math.random() * 25 + 5),
      lastUpdated: new Date().toISOString()
    };
  }

  async getHistoricalWeather(locationId, startDate, endDate) {
    const location = await this.getLocationWeather(locationId);
    
    // Generate mock historical data
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const historicalData = [];
    
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        ...this.generateRealtimeWeatherData(location),
        thunderstormOccurred: Math.random() < (location.risk === 'Red' ? 0.3 : location.risk === 'Yellow' ? 0.1 : 0.02)
      });
    }
    
    return historicalData;
  }

  async getWeatherAlerts() {
    const activeAlerts = this.mockLocations
      .filter(location => location.alert && location.risk !== 'Green')
      .map(location => ({
        id: `alert_${location.id}_${Date.now()}`,
        locationId: location.id,
        locationName: location.name,
        severity: location.risk,
        title: location.status,
        message: location.alert,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        type: 'thunderstorm'
      }));

    return activeAlerts;
  }

  startRealTimeUpdates() {
    // Update weather data every 2 minutes
    this.updateInterval = setInterval(() => {
      console.log('🌦️ Updating weather data...');
      
      // Simulate weather changes
      this.mockLocations.forEach(location => {
        const riskChange = (Math.random() - 0.5) * 0.1;
        
        // Occasionally change risk levels for realism
        if (Math.random() < 0.05) { // 5% chance every 2 minutes
          const risks = ['Green', 'Yellow', 'Red'];
          const currentIndex = risks.indexOf(location.risk);
          const newIndex = Math.max(0, Math.min(2, currentIndex + (Math.random() > 0.5 ? 1 : -1)));
          location.risk = risks[newIndex];
          
          console.log(`📊 ${location.name} risk level changed to ${location.risk}`);
        }
      });
    }, 2 * 60 * 1000);
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

module.exports = new WeatherService();