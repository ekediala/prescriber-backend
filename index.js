const functions = require('firebase-functions');

const app = require('./src/main');

exports.api = functions.https.onRequest(app);
