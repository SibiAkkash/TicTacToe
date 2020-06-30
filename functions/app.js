const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-functions");
admin.initializeApp();

const routes = require("./controllers/index");
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(routes);

exports.apiv2 = functions.https.onRequest(app);

