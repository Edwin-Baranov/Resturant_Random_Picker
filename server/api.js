const axios = require('axios');
const url = require('url');
const tokens = require('../tokens.js');

const apiKey = tokens.googleAPIKey;
const placesApiURL = 'https://maps.googleapis.com/maps/api/place'

function getCordinatesFromSearch(addressString, callback) {
  const myURL = new URL(placesApiURL + '/findplacefromtext/json');
  myURL.searchParams.append('fields', 'geometry/location');
  myURL.searchParams.append('input', addressString);
  myURL.searchParams.append('inputtype', 'textquery');
  myURL.searchParams.append('key', apiKey);

  axios.get(myURL.href)
    .then(response => { callback(null, response.data.candidates[0]) })
    .catch(err => { callback(err); })
};

function filterResults(response, results) {
  let data = response.data.results;
  data = data.filter(place => place.business_status === 'OPERATIONAL');
  results = results.concat(data);

  let uniqueData = {};
  results.forEach(place => { uniqueData[place.name] = place });
  results = Object.values(uniqueData);

  return results;
}

function getPlacesFromURL(searchURL, nextPageToken, counter, results, callback) {
  const myURL = new URL(searchURL);

  if (counter <= 0) {
    callback(null, results);
    return;
  }

  counter--;

  if (typeof (nextPageToken) !== 'string') {
    callback(null, results);
    return;
  } else {
    myURL.searchParams.set('pagetoken', nextPageToken);
  }

  axios.get(myURL.href)
    .then(response => {
      let output = filterResults(response, results);

      setTimeout(() => { getPlacesFromURL(myURL.href, response.data.next_page_token, counter, output, callback) }, 2000);
    })
    .catch(err => { callback(err); })
};

module.exports = {
  getRestaruntsNearAddress: (addressString, callback) => {
    let resultData = [];

    getCordinatesFromSearch(addressString, (err, result) => {
      if (err) {
        callback(err);
      } else {
        if (!result) {
          callback(null, null);
        } else {
          const myURL = new URL(placesApiURL + '/nearbysearch/json');
          myURL.searchParams.append('location', `${result.geometry.location.lat}, ${result.geometry.location.lng}`);
          myURL.searchParams.append('type', 'restaurant');
          myURL.searchParams.append('radius', 6500);
          myURL.searchParams.append('pagetoken', '');
          myURL.searchParams.append('key', apiKey);

          getPlacesFromURL(myURL.href, '', 5, resultData, callback)
        }
      }
    });
  }
}