# Restaurant Random Picker

A web app built with React 18, Node.js, and Express that searches a given area for restaurants using Google's Places API, filters out duplicates, and randomly picks one — displayed with a Google Static Maps image.

Originally created as a Hack Reactor MVP assignment (2-day time limit), now modernized with updated dependencies, proper API key security, async/await patterns, and responsive styling.

## Setup

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and add your Google API key:
   ```
   GOOGLE_API_KEY=your_key_here
   ```
4. Run `npm run build`
5. Run `npm start`
6. Open `http://localhost:3000`

<img src="https://i.imgur.com/B8dclea.png"/>
