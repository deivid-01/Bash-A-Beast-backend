const functions =require("firebase-functions");
const admin =require("firebase-admin");
const express =require("express");

const app = express();
admin.initializeApp({
  credential: admin.credential.cert("./permissions.json"),
});

app.use(require("./routes/players.routes"));
exports.app = functions.https.onRequest(app);
