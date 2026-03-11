const axios = require('axios');

const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

function getApiKey() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }
  return key;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCoordinatesFromSearch(addressString) {
  const apiKey = getApiKey();
  const url = new URL(`${PLACES_API_URL}/findplacefromtext/json`);
  url.searchParams.append('fields', 'geometry/location');
  url.searchParams.append('input', addressString);
  url.searchParams.append('inputtype', 'textquery');
  url.searchParams.append('key', apiKey);

  const response = await axios.get(url.href);
  return response.data.candidates[0] || null;
}

function filterAndDeduplicate(newResults, existingResults) {
  const operational = newResults.filter((place) => place.business_status === 'OPERATIONAL');
  const combined = existingResults.concat(operational);

  const uniqueByName = {};
  combined.forEach((place) => {
    uniqueByName[place.name] = place;
  });

  return Object.values(uniqueByName);
}

async function fetchPaginatedPlaces(searchURL, maxPages = 5) {
  let results = [];
  let nextPageToken = '';

  for (let page = 0; page < maxPages; page++) {
    const url = new URL(searchURL);
    url.searchParams.set('pagetoken', nextPageToken);

    const response = await axios.get(url.href);
    results = filterAndDeduplicate(response.data.results, results);

    nextPageToken = response.data.next_page_token;
    if (!nextPageToken) break;

    // Google Places API requires a short delay before using next_page_token
    await delay(2000);
  }

  return results;
}

async function getRestaurantsNearAddress(addressString) {
  const coordinates = await getCoordinatesFromSearch(addressString);

  if (!coordinates) {
    return null;
  }

  const apiKey = getApiKey();
  const { lat, lng } = coordinates.geometry.location;
  const url = new URL(`${PLACES_API_URL}/nearbysearch/json`);
  url.searchParams.append('location', `${lat}, ${lng}`);
  url.searchParams.append('type', 'restaurant');
  url.searchParams.append('radius', '6500');
  url.searchParams.append('pagetoken', '');
  url.searchParams.append('key', apiKey);

  return fetchPaginatedPlaces(url.href);
}

function getStaticMapURL(lat, lng) {
  const apiKey = getApiKey();
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=500x500&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
}

module.exports = { getRestaurantsNearAddress, getStaticMapURL, filterAndDeduplicate };
