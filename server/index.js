require('dotenv').config();

const express = require('express');
const path = require('path');
const api = require('./api.js');

const port = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '../client/dist');

const app = express();
app.use(express.json());
app.use(express.static(DIST_DIR));

app.get('/api/search', async (req, res) => {
  const { address } = req.query;

  if (!address || !address.trim()) {
    return res.status(400).json({ error: 'Address query parameter is required' });
  }

  try {
    const results = await api.getRestaurantsNearAddress(address);
    if (!results) {
      return res.status(404).json({ error: 'No location found for that address' });
    }
    res.json(results);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Failed to search for restaurants' });
  }
});

app.get('/api/static-map', (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng query parameters are required' });
  }

  try {
    const mapURL = api.getStaticMapURL(lat, lng);
    res.json({ url: mapURL });
  } catch (err) {
    console.error('Static map error:', err.message);
    res.status(500).json({ error: 'Failed to generate map URL' });
  }
});

app.listen(port, () => {
  console.log(`Restaurant Random Picker listening on port ${port}`);
});
