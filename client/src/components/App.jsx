import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PLACEHOLDER_IMAGE =
  'https://as1.ftcdn.net/v2/jpg/03/07/25/60/500_F_307256093_I8qlofSMsp8E9qK1MO7lwmB5ejd01t19.jpg';

const App = () => {
  const [locationText, setLocationText] = useState('');
  const [appState, setAppState] = useState('idle');
  const [placesList, setPlacesList] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [imageURL, setImageURL] = useState(PLACEHOLDER_IMAGE);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentSelection === null) return;

    const { lat, lng } = currentSelection.geometry.location;
    axios
      .get('/api/static-map', { params: { lat, lng } })
      .then((res) => setImageURL(res.data.url))
      .catch(() => setImageURL(PLACEHOLDER_IMAGE));
  }, [currentSelection]);

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmed = locationText.trim();
    if (!trimmed) return;

    setAppState('searching');
    setError(null);

    try {
      const res = await axios.get('/api/search', {
        params: { address: trimmed },
      });

      const data = res.data;

      if (!data || data.length === 0) {
        setError('No restaurants found near that location.');
        setAppState('idle');
        return;
      }

      setPlacesList(data);
      setCurrentSelection(data[Math.floor(Math.random() * data.length)]);
      setAppState('found');
    } catch (err) {
      const message =
        err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(message);
      setAppState('idle');
    }
  }

  function handleOpenInMaps() {
    const { name, vicinity, place_id } = currentSelection;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        name
      )}%20${encodeURIComponent(vicinity)}&query_place_id=${place_id}`
    );
  }

  function handleCycle() {
    setCurrentSelection(
      placesList[Math.floor(Math.random() * placesList.length)]
    );
  }

  return (
    <>
      <h1>Restaurant Random Picker</h1>
      <h3>Where will you dine today?</h3>

      <form id="locationSearch" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter an address or location..."
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
        />
        <button type="submit" disabled={appState === 'searching'}>
          {appState === 'searching' ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <img id="primaryDisplay" src={imageURL} alt="Restaurant location map" />

      {currentSelection && (
        <div id="currentSelection">
          <p onClick={handleOpenInMaps}>
            Current Selection: {currentSelection.name}
          </p>
          <p className="rating">
            Rating: {currentSelection.rating ?? 'N/A'} |
            Total ratings: {currentSelection.user_ratings_total ?? 'N/A'}
          </p>
          <button onClick={handleCycle}>Pick Another</button>
        </div>
      )}
    </>
  );
};

export default App;