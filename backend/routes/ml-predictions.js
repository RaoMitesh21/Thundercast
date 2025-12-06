const express = require('express');
const router = express.Router();
const mlService = require('../services/mlService');

// Run thunderstorm prediction with custom parameters
router.post('/predict', async (req, res) => {
  try {
    console.log('🤖 ML Prediction request received');
    const parameters = req.body;
    
    // Validate required parameters
    const requiredParams = [
      'wind_sfc_speed_ms', 'wind_sfc_dir_deg', 'wind_500_speed_ms', 'wind_500_dir_deg',
      'temp_2m_C', 'temp_500_C', 'rh_2m_pct', 'pressure_sfc_hPa',
      'precipitable_water_mm', 'cloud_cover_frac', 'cloud_top_temp_C',
      'CAPE_Jkg', 'Lifted_Index_C', 'K_index', 'shear_850_500_ms'
    ];

    const missingParams = requiredParams.filter(param => !(param in parameters));
    if (missingParams.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required parameters: ${missingParams.join(', ')}`
      });
    }

    const prediction = await mlService.predictThunderstorm(parameters);
    
    res.json({
      success: true,
      data: {
        ...prediction,
        modelType: prediction.modelType || 'ML Thunderstorm Predictor',
        features: requiredParams.length,
        processingTime: Date.now()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ML Prediction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get prediction for specific location with current weather data
router.get('/predict/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    console.log(`🌍 ML Prediction for location: ${locationId}`);
    
    const prediction = await mlService.predictForLocation(locationId);
    
    res.json(prediction);
  } catch (error) {
    console.error(`❌ Location prediction error for ${req.params.locationId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      locationId: req.params.locationId
    });
  }
});

// Get model performance metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await mlService.getModelMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
