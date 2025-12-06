class MLService {
  constructor() {
    this.baseURL = 'http://localhost:5001/api'; // Flask backend port
    this.cache = new Map();
    this.cacheTimeout = 2 * 60 * 1000; // 2 minutes cache
  }

  async predictThunderstorm(parameters) {
    console.log('🚀 Requesting ML prediction from backend...');
    
    try {
      const response = await fetch(`${this.baseURL}/ml/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ ML prediction received:', {
        success: result.success,
        probability: result.data?.probability,
        risk_level: result.data?.risk_level
      });
      
      return result;
    } catch (error) {
      console.error('❌ ML Service Error:', error);
      throw error;
    }
  }

  async predictForLocation(locationId) {
    console.log(`🌍 Requesting prediction for location: ${locationId}`);
    
    // Check cache first
    const cacheKey = `location_${locationId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      console.log('📦 Using cached prediction');
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseURL}/ml/predict/${locationId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      console.log('✅ Location prediction received:', {
        success: result.success,
        location: locationId
      });
      
      return result;
    } catch (error) {
      console.error(`❌ Location prediction error for ${locationId}:`, error);
      throw error;
    }
  }

  async getModelMetrics() {
    try {
      const response = await fetch(`${this.baseURL}/ml/metrics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Model metrics error:', error);
      throw error;
    }
  }

  async getRealTimeUpdates(locationId) {
    try {
      const response = await fetch(`${this.baseURL}/ml/monitor/${locationId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Real-time updates error:', error);
      throw error;
    }
  }
}

const mlService = new MLService();
export default mlService;
