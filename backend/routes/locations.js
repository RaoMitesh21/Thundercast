const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

// Get all monitored locations
router.get('/', async (req, res) => {
  try {
    console.log('🌍 Fetching all locations...');
    const locations = await weatherService.getCurrentWeather();
    
    res.json({
      success: true,
      data: locations.map(location => ({
        id: location.id,
        name: location.name,
        country: location.country,
        coordinates: location.coordinates,
        risk: location.risk,
        status: location.status,
        lastUpdated: location.lastUpdated
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get location details by ID
router.get('/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const location = await locationService.getLocationById(locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }
    
    res.json({
      success: true,
      data: location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add new monitoring location
router.post('/', async (req, res) => {
  try {
    const locationData = req.body;
    const newLocation = await locationService.addLocation(locationData);
    
    res.status(201).json({
      success: true,
      data: newLocation,
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
