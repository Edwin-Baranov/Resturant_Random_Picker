import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 };
const DEFAULT_ZOOM = 13;
const PLACEHOLDER_IMAGE =
  'https://as1.ftcdn.net/v2/jpg/03/07/25/60/500_F_307256093_I8qlofSMsp8E9qK1MO7lwmB5ejd01t19.jpg';

const App = () => {
  const [locationText, setLocationText] = useState('');
  const [appState, setAppState] = useState('idle');
  const [placesList, setPlacesList] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const markerClassRef = useRef(null);
  const infoWindowRef = useRef(null);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const loaderReadyRef = useRef(false);

  // Measure header height and sync to selection area
  useEffect(() => {
    if (!headerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setHeaderHeight(entry.contentRect.height);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  // Load the Maps JS API and initialize hidden map on mount
  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        const { data } = await axios.get('/api/config');

        setOptions({
          key: data.mapsApiKey,
          v: 'weekly',
        });

        const { Map } = await importLibrary('maps');
        const { AdvancedMarkerElement } = await importLibrary('marker');
        if (cancelled) return;

        const map = new Map(mapRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapId: 'restaurant-picker-map',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;
        markerClassRef.current = AdvancedMarkerElement;
        setMapReady(true);
      } catch (err) {
        console.error('Failed to load Google Maps:', err);
      }
    }

    initMap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Update marker when selection changes
  const updateMarker = useCallback(
    (place) => {
      if (!mapReady || !place) return;

      const map = mapInstanceRef.current;
      const MarkerClass = markerClassRef.current;
      const { latitude: lat, longitude: lng } = place.location;
      const position = { lat, lng };

      // Remove previous marker
      if (markerRef.current) {
        markerRef.current.map = null;
      }

      // Close previous info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      const marker = new MarkerClass({
        position,
        map,
        title: place.displayName?.text || 'Restaurant',
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<strong>${place.displayName?.text || ''}</strong><br/>${place.formattedAddress || ''}`,
      });
      marker.addListener('gmp-click', () => infoWindow.open({ map, anchor: marker }));

      markerRef.current = marker;
      infoWindowRef.current = infoWindow;
      map.panTo(position);
      map.setZoom(16);
    },
    [mapReady]
  );

  useEffect(() => {
    updateMarker(currentSelection);
  }, [currentSelection, updateMarker]);

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
      setHasSearched(true);
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(message);
      setAppState('idle');
    }
  }

  function handleOpenInMaps() {
    if (currentSelection.googleMapsUri) {
      window.open(currentSelection.googleMapsUri);
    } else {
      const name = currentSelection.displayName?.text || '';
      const address = currentSelection.formattedAddress || '';
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + address)}`
      );
    }
  }

  function handleCycle() {
    setCurrentSelection(placesList[Math.floor(Math.random() * placesList.length)]);
  }

  return (
    <>
      <div id="appHeader" ref={headerRef}>
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
      </div>

      {error && <p className="error-message">{error}</p>}

      <div id="mapWrapper">
        <div id="mapContainer" ref={mapRef} />
        <img
          id="placeholderImage"
          src={PLACEHOLDER_IMAGE}
          alt="Restaurant placeholder"
          className={hasSearched ? 'fade-out' : ''}
        />
      </div>

      <div id="currentSelection" style={{ minHeight: headerHeight }}>
        {currentSelection ? (
          <>
            <p onClick={handleOpenInMaps}>
              Current Selection: {currentSelection.displayName?.text}
            </p>
            <p className="rating">
              Rating: {currentSelection.rating ?? 'N/A'} | Total ratings:{' '}
              {currentSelection.userRatingCount ?? 'N/A'}
            </p>
            <button onClick={handleCycle}>Pick Another</button>
          </>
        ) : (
          <p className="placeholder">Search for a location to pick a restaurant</p>
        )}
      </div>
    </>
  );
};

export default App;
