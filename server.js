// https://sitepoint.com/single-page-app-without-framework/
// https://github.com/sitepoint-editors/single-page-application/blob/master/server.js

require('dotenv').config(); // read .env files and write to process.env
const express = require('express');
const bodyParser = require('body-parser');

const { getPhotos, sendPost } = require('./lib/api-service');

const app = express();
const port = process.env.PORT || 3000

// set public folder as root -> root + get url
app.use(express.static('public'));

//Allow front-end access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

// PUT THIS BEFORE THE REDIRECTION TO INDEX.html
// @TODO MOVE TO CONTROLLER
// Express Error handler

// Parse POST data as URL encoded data
app.use(bodyParser.urlencoded({
  extended: true,
}));

// Parse POST data as JSON
app.use(bodyParser.json());

const errorHandler = (err, req, res) => {
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(403).send({ title: 'Server responded with an error', message: err.message });
    } else if (err.request) {
      // The request was made but no response was received
      res.status(503).send({ title: 'Unable to communicate with server', message: err.message });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).send({ title: 'An unexpected error occurred', message: err.message });
    }
  };
  
  // @TODO MOVE TO CONTROLLER
  // Fetch Photos
  app.get('/api/question', async (req, res) => {
    try {
      const data = await getPhotos();
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    } catch (error) {
      errorHandler(error, req, res);
    }
  });

  app.post('/api/posts', async(req, res) => {
    try {
      const body = req.body;
      console.log(body);

      const data = await sendPost(body);
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    } catch(error) {
      errorHandler(error, req, res);
    }
  });

//Redirect all traffic to public/index.html
// since not path is specified, this middleware will be used in all requests
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

app.listen(port, () => console.log('listening on %d', port));
