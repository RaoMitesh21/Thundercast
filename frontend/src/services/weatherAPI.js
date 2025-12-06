const API_BASE_URL = 'http://localhost:2100/api';

export class WeatherPredictionService {
  static async predictThunderstorm(weatherData) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(weatherData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Prediction API error:', error);
      throw error;
    }
  }

  static async predictLocationWeather(location) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Location prediction API error:', error);
      throw error;
    }
  }

  static async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      return { status: 'error', model_loaded: false };
    }
  }

  // Update the prediction method to accept custom parameters
  static async predictWithCustomParams(customParams) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customParams)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Custom prediction API error:', error);
      throw error;
    }
  }

  // Enhanced location weather prediction with custom parameters
  static async predictLocationWeatherWithParams(location, customParams = null) {
    try {
      const requestData = {
        location: location.location || location.name,
        lat: location.lat,
        lng: location.lng,
        ...(customParams && { custom_params: customParams })
      };

      const response = await fetch(`${API_BASE_URL}/predict-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Location prediction with params API error:', error);
      throw error;
    }
  }

  // Generate weather data with custom parameters
  static generateWeatherDataWithParams(location, customParams = null) {
    if (customParams) {
      return customParams;
    }
    
    const baseTemp = 20 + (Math.random() - 0.5) * 20;
    const baseHumidity = 60 + (Math.random() - 0.5) * 30;
    const basePressure = 1013 + (Math.random() - 0.5) * 40;
    
    return {
      wind_sfc_speed_ms: 5 + Math.random() * 15,
      wind_sfc_dir_deg: Math.random() * 360,
      wind_500_speed_ms: 10 + Math.random() * 20,
      wind_500_dir_deg: Math.random() * 360,
      temp_2m_C: baseTemp,
      temp_500_C: baseTemp - 25 + (Math.random() - 0.5) * 10,
      rh_2m_pct: Math.max(20, Math.min(100, baseHumidity)),
      pressure_sfc_hPa: basePressure,
      precipitable_water_mm: 10 + Math.random() * 40,
      cloud_cover_frac: Math.random(),
      cloud_top_temp_C: -20 + (Math.random() - 0.5) * 20,
      CAPE_Jkg: Math.random() * 3000,
      Lifted_Index_C: (Math.random() - 0.5) * 10,
      K_index: 15 + Math.random() * 20,
      shear_850_500_ms: Math.random() * 25
    };
  }

  // Validate ML parameters
  static validateMLParameters(params) {
    const requiredParams = [
      'wind_sfc_speed_ms', 'wind_sfc_dir_deg', 'wind_500_speed_ms', 'wind_500_dir_deg',
      'temp_2m_C', 'temp_500_C', 'rh_2m_pct', 'pressure_sfc_hPa',
      'precipitable_water_mm', 'cloud_cover_frac', 'cloud_top_temp_C',
      'CAPE_Jkg', 'Lifted_Index_C', 'K_index', 'shear_850_500_ms'
    ];

    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    requiredParams.forEach(param => {
      if (params[param] === undefined || params[param] === null) {
        validation.errors.push(`Missing parameter: ${param}`);
        validation.isValid = false;
      }
    });

    // Add range validation
    const ranges = {
      'wind_sfc_speed_ms': [0, 50],
      'wind_sfc_dir_deg': [0, 360],
      'temp_2m_C': [-40, 50],
      'rh_2m_pct': [0, 100],
      'pressure_sfc_hPa': [950, 1050],
      'CAPE_Jkg': [0, 10000]
    };

    Object.entries(ranges).forEach(([param, [min, max]]) => {
      if (params[param] !== undefined) {
        if (params[param] < min || params[param] > max) {
          validation.warnings.push(`${param} outside typical range [${min}, ${max}]`);
        }
      }
    });

    return validation;
  }
}

// Global function to update ML parameters from LayerPanel
window.updateMLParameters = async (params) => {
  try {
    const validation = WeatherPredictionService.validateMLParameters(params);
    
    if (!validation.isValid) {
      console.error('Invalid ML parameters:', validation.errors);
      return;
    }

    if (validation.warnings.length > 0) {
      console.warn('ML parameter warnings:', validation.warnings);
    }

    const prediction = await WeatherPredictionService.predictWithCustomParams(params);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('mlParametersUpdated', {
      detail: { params, prediction }
    }));
    
    console.log('ML parameters updated:', prediction);
  } catch (error) {
    console.error('Error updating ML parameters:', error);
  }
};
