class WindspeedService {
  constructor() {
    this.baseURL = 'http://localhost:5001/api';
  }

  async predictWindspeed(parameters) {
    try {
      const response = await fetch(`${this.baseURL}/windspeed/predict`, {
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
      console.log('✅ Windspeed prediction received:', result);
      return result;
    } catch (error) {
      console.error('❌ Windspeed Service Error:', error);
      throw error;
    }
  }

  async predictForLocation(locationId) {
    try {
      const response = await fetch(`${this.baseURL}/windspeed/predict/${locationId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`❌ Windspeed prediction error for ${locationId}:`, error);
      throw error;
    }
  }
}

const windspeedService = new WindspeedService();
export default windspeedService;
