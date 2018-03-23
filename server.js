const express = require("express");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const admin = require("firebase-admin");

var serviceAccount = require("./VAINZONE-851534c01db3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

app
  .prepare()
  .then(() => {
    const server = express();

    server.get("/player", (req, res) => {
      db
        .collection("players")
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            console.log(doc.id, "=>", doc.data());
          });
        })
        .catch(err => {
          console.log("Error getting documents", err);
        });
    });

    server.get("/player/:IGN", (req, res) => {
      var documentReference = db.collection("players").doc(req.params.IGN);

      var setPlayer = documentReference.set({
        IGN: req.params.IGN,
        retrieval: new Date(),
        rank: "Vainglorious Bronze"
      });
    });

    // server.get("/p/:id", (req, res) => {
    //   const actualPage = "/post";
    //   const queryParams = { id: req.params.id };
    //   app.render(req, res, actualPage, queryParams);
    // });

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, err => {
      if (err) throw err;
      console.log("> Ready on http://localhost:3000");
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
