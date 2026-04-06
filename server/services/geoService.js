const axios = require('axios');

// Takes a city name or address string
// Returns { latitude, longitude, formattedAddress }
const getCoordinates = async (address) => {
  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: address,
        key: process.env.OPENCAGE_API_KEY,
        limit: 1,
        language: 'en'
      }
    });

    const results = response.data.results;

    if (!results || results.length === 0) {
      throw new Error('No location found for the provided address');
    }

    const { lat, lng } = results[0].geometry;
    const formattedAddress = results[0].formatted;

    return {
      latitude: lat,
      longitude: lng,
      formattedAddress
    };

  } catch (error) {
    console.error('GeoService error:', error.message);
    throw new Error('Failed to get coordinates: ' + error.message);
  }
};

module.exports = { getCoordinates };