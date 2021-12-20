import React, { useState, useEffect } from 'react';
import axios from 'axios';
const tokens = require('../../../tokens.js');

const App = () => {
  const [locationText, setLocationText] = useState('');
  const [appState, setAppState] = useState('submit');
  const [placesList, setPlacesList] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [imageURL, setImageURL] = useState('https://as1.ftcdn.net/v2/jpg/03/07/25/60/500_F_307256093_I8qlofSMsp8E9qK1MO7lwmB5ejd01t19.jpg')

  useEffect(() => {
    if (currentSelection !== null) {
      let lat = currentSelection.geometry.location.lat;
      let lng = currentSelection.geometry.location.lng;
      let htmlLink = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=500x500&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${tokens.googleAPIKey}`;
      setImageURL(htmlLink);
    }
  }, [currentSelection]);

  function handleSubmit(e) {
    setAppState('searching');
    axios.get(`/api/cordSearch?address=${locationText}`)
      .then(res => {
        setPlacesList(res.data);
        setAppState('found');
        setCurrentSelection(res.data[Math.floor(Math.random() * res.data.length)]);
      });
    e.preventDefault();
  }

  function handleCurrentSearch() {
    window.open(`https://www.google.com/maps/search/?api=1&query=${currentSelection.name}%20${currentSelection.vicinity}&query_place_id=${currentSelection.place_id}`);
  }

  function handleCycle() {
    setCurrentSelection(
      placesList[
      Math.floor(Math.random() * placesList.length)
      ]
    );
  }

  function renderCurrentSelection() {
    if (currentSelection !== null) {
      return <div id='currentSelection'>
        <p onClick={handleCurrentSearch}>Current Selection: {currentSelection.name}</p>
        <button onClick={handleCycle}>Cycle</button>
      </div>
    }
  }

  return (
    <>
      <h1>Restaurant rando picker</h1>
      <h3>where will you dine today?</h3>
      <form id='locationSearch' onSubmit={handleSubmit}>
        <input type='text' value={locationText} onChange={(e) => { setLocationText(e.target.value); }} />
        <input type='submit' value={appState} disabled={appState === 'searching'} />
      </form>

      <img id='primaryDisplay' src={imageURL} />
      {renderCurrentSelection()}
    </>
  )
}

export default App;