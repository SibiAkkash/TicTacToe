const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const admin = require("firebase-admin");

admin.initializeApp();

const app = express();

// Cross origin resource sharing
app.use(cors());
// convert raw request body to json
app.use(bodyParser.json());
app.use(express.json());

app.use('/', require('./controllers'));

exports.apiv2 = functions.https.onRequest(app);

