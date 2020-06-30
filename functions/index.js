const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const admin = require("firebase-admin");

// call this first
admin.initializeApp();

const app = express();

// Cross origin resource sharing
app.use(cors());

// not very sure check pls
app.use(express.json());

// mount all the routes
app.use('/', require('./controllers'));

exports.apiv2 = functions.https.onRequest(app);

