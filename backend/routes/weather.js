const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

// Get current weather data for all stations
router.get('/current', async (req, res) => {
  try {
    console.log('📊 Fetching current weather data...');
    const weatherData = await weatherService.getCurrentWeather();
    
    res.json({
      success: true,
      data: weatherData,
      count: weatherData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching current weather:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get weather data for specific location
router.get('/location/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const weatherData = await weatherService.getLocationWeather(locationId);
    res.json({
      success: true,
      data: weatherData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get historical weather data
router.get('/history/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { startDate, endDate } = req.query;
    const historicalData = await weatherService.getHistoricalWeather(locationId, startDate, endDate);
    res.json({
      success: true,
      data: historicalData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get weather alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await weatherService.getWeatherAlerts();
    res.json({
      success: true,
      data: alerts,
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
