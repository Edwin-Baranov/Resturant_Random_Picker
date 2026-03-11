const axios = require('axios');

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus',
  'places.googleMapsUri',
].join(',');

function getApiKey() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }
  return key;
}

function deduplicate(places) {
  const uniqueByName = {};
  places.forEach((place) => {
    const name = place.displayName?.text || place.id;
    uniqueByName[name] = place;
  });
  return Object.values(uniqueByName);
}

async function searchRestaurants(addressString) {
  const apiKey = getApiKey();

  const response = await axios.post(
    PLACES_API_URL,
    {
      textQuery: `restaurants near ${addressString}`,
      includedType: 'restaurant',
      pageSize: 20,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
    }
  );

  const places = response.data.places || [];
  return deduplicate(places);
}

module.exports = { searchRestaurants, deduplicate };
