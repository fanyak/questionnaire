// https://sitepoint.com/single-page-app-without-framework/
// https://github.com/sitepoint-editors/single-page-application/blob/master/server.js

require('dotenv').config(); // read .env files and write to process.env
const express = require('express');

const fs = require('fs');
const readline = require('readline');

const {google} = require('googleapis');
const sheets = google.sheets('v4');

const { getQuestions, sendPost } = require('./lib/api-service');

const app = express();
const port = process.env.PORT || 3000;

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';



// set public folder as root -> root + get url
app.use(express.static('public'));

//Allow front-end access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

// PUT THIS BEFORE THE REDIRECTION TO INDEX.html
// @TODO MOVE TO CONTROLLER
// Express Error handler


const colDict = {'How much': 'A', 'How Long': 'B'};

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
  app.get('/api/questions', async (req, res) => {
    try {
      const data = await getQuestions();
      console.log(data);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      errorHandler(error, req, res);
    }
  });

  app.post('/api/posts', express.json(), async(req, res) => {
    const body = req.body;
    console.log(1111, body, colDict[body.title]);
    // try {
    //   const body = req.body;
    //   console.log(body);
    //   const data = await sendPost(body);
    //   res.setHeader('Content-Type', 'application/json');
    //   res.send(data);
    // } catch(error) {
    //   errorHandler(error, req, res);
    // }

 //@TODO move this 
    function authorize(token) {
      // Load client secrets from a local file.
      return fs.promises.readFile('credentials.json')
      .then((content) => {
        //console.log(content);
        // Authorize a client with credentials, then call the Google Sheets API.
        return JSON.parse(content);        
      }).then(async (credentials) => {
        const {client_secret, client_id, redirect_uris} = credentials.web;
        const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);    
        // Check if we have previously stored a token.
        console.log(credentials) ;
        oAuth2Client.setCredentials(JSON.parse(token));       
        return oAuth2Client;
      });      
    }

      // Load client secrets from a local file.
    const token = await fs.promises.readFile(TOKEN_PATH); 
    const authClient = await authorize(token);
    let nextCell;
    if(body.cache) {
      console.log(body.cache);

      // NOTE: works when column is 1 letter!!!!!!!!!!!!!!!!!!!!!
     const [cached, column,row] = body.cache.split('!')[1].match(/(\w{1})(\d+)/);      
      console.log(cached, column, row);
    }
    else {
      //nextRow = 1;
    }
    const request = {
      // The ID of the spreadsheet to update.
      spreadsheetId: '1Axyu5zffLwUQrQLqnC-M2MPd2fA8YQIZCij8HiqbYkg',  // TODO: Update placeholder value.

      // The A1 notation of a range to search for a logical table of data.
      // Values are appended after the last row of the table.
      range: `Sheet1!${colDict[body.title]}${Number(1)+1}`, //'A1:A1',  // TODO: Update placeholder value.

      // How the input data should be interpreted.
      valueInputOption: 'RAW',  // TODO: Update placeholder value.

      // How the input data should be inserted.
      insertDataOption: 'INSERT_ROWS',  // TODO: Update placeholder value.

      resource: {
        // TODO: Add desired properties to the request body.
        values: [[body.choices]]
      },

      auth: authClient,
  };  

  try {
    const response = (await sheets.spreadsheets.values.append(request)).data;
    // TODO: Change code below to process the `response` object:
    const data = JSON.stringify(response, null, 2);
    console.log(JSON.stringify(response, null, 2));
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error(err);
    errorHandler(err, req, res);

  }
  });

//Redirect all traffic to public/index.html
// since not path is specified, this middleware will be used in all requests
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

app.listen(port, () => console.log('listening on %d', port));
