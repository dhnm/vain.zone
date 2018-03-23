const express = require("express");
const next = require("next");

const path = require("path");
const PORT = process.env.PORT || 3000;

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

    if (!dev) {
      // Enforce SSL & HSTS in production
      server.use(function(req, res, next) {
        var proto = req.headers["x-forwarded-proto"];
        if (proto === "https") {
          res.set({
            "Strict-Transport-Security": "max-age=31557600" // one-year
          });
          return next();
        }
        res.redirect("https://" + req.headers.host + req.url);
      });
    }

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

    server.listen(PORT, err => {
      if (err) throw err;
      console.log("> Ready on http://localhost:" + PORT);
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
