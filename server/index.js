const api = require('./api.js');
const express = require('express');
const path = require('path');

const port = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '../client/dist');

const app = express();
app.use(express.json());
app.use(express.static(DIST_DIR));

app.get('/api/cordSearch', (req, res) => {
  api.getRestaruntsNearAddress(req.query.address, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(results);
    }
  })
});

app.listen(port, function () {
 console.log('App listening on port: ' + port);
});