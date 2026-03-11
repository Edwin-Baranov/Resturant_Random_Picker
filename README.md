# Restaurant Random Picker

A web app built with React 18, Node.js, and Express that searches a given area for restaurants using Google's Places API (New), filters out duplicates, and randomly picks one — displayed on an interactive Google Map with adjustable search radius.

Originally created as a Hack Reactor MVP assignment (2-day time limit), now modernized with updated dependencies, proper API key security, async/await patterns, interactive maps, and responsive styling.

## Features

- Interactive Google Map with Advanced Markers and info windows
- Adjustable search radius filter (5–30 miles)
- Restaurant type display (e.g. "Italian Restaurant")
- Smooth crossfade transition from placeholder to map
- Responsive flexbox layout

## Setup

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and add your Google API key:
   ```
   GOOGLE_API_KEY=your_key_here
   ```
4. Enable **Places API (New)** and **Maps JavaScript API** in Google Cloud Console
5. Run `npm run build`
6. Run `npm start`
7. Open `http://localhost:3000`

<img src="https://i.imgur.com/B8dclea.png"/>
