require('dotenv').config();

const express = require('express');
const path = require('path');
const api = require('./api.js');

const port = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '../client/dist');

const app = express();
app.use(express.json());
app.use(express.static(DIST_DIR));

app.get('/api/config', (req, res) => {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  res.json({ mapsApiKey: key });
});

app.get('/api/search', async (req, res) => {
  const { address, lat, lng, radius } = req.query;

  if (!address || !address.trim()) {
    return res.status(400).json({ error: 'Address query parameter is required' });
  }

  try {
    const results = await api.searchRestaurants(address, { lat, lng, radius });
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No restaurants found near that address' });
    }
    res.json(results);
  } catch (err) {
    console.error('Search error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to search for restaurants' });
  }
});

app.listen(port, () => {
  console.log(`Restaurant Random Picker listening on port ${port}`);
});
