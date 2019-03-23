const app = require("express")();
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const db = mongoose.connection;

const http = require("http").createServer(app);
const io = require("socket.io")(http);

const helmet = require("helmet");
const compression = require("compression");
// const crypto = require('crypto');
// function encrypt(text) {
//   const cipher = crypto.createCipher(
//     'aes-256-ctr',
//     'PqTJKyuK-uTC6nsnk-AVm7DpFs-jZdfn8Vk-wAyFddh6',
//   );

//   return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
// }
// function decrypt(text, password) {
//   const decipher = crypto.createDecipher(
//     'aes-256-ctr',
//     password + 'PqTJKyuK-uTC6nsnk-AVm7DpFs-jZdfn8Vk-wAyFddh6',
//   );
//   return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
// }

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

const nextApp = require("next")({ dev });
const nextHandler = nextApp.getRequestHandler();
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();

import axios from "axios";

import extension from "./extension";
import draft from "./draft";
import api from "./api";

// import { Match } from "./../models/Match";
// import { Player } from "./../models/Player";
// import { CzSk } from './../models/CzSk';

mongoose.connect(serverRuntimeConfig.mongodbURL);
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("We're connected!");
});

const draftIO = io.of("/draft");
draftIO.on("connection", socket => {
  socket.on("join room", room => {
    socket.join(room);
  });

  socket.on("verify", data => {
    const roomID = data.keys.roomID;
    const roomIDWithoutNamespace = roomID.split("#")[1];
    const rooms = Object.assign({}, io.sockets.adapter.rooms);

    if (data.keys.teamID) {
      socket.join(`${roomID}/${data.keys.teamID}`);
    }
    socket.join(roomID);

    if (
      rooms[roomIDWithoutNamespace] &&
      rooms[roomIDWithoutNamespace].sockets[roomIDWithoutNamespace]
    ) {
      socket.to(data.keys.recipientID).emit("verify", data);
    } else {
      socket.emit("data transfer", { keys: { failed: true } });
    }
  });

  socket.on("data transfer", data => {
    socket.to(data.keys.recipientID).emit("data transfer", data);
  });

  socket.on("host update", data => {
    socket.to(data.keys.recipientID).emit("host update", data);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("socket disconnected", socket.id);
  });
});

setInterval(() => {
  axios({
    method: "get",
    url: "https://vain.zone/"
  })
    .then(response => {
      console.log("here1", response);
    })
    .catch(function(error) {
      console.error(error);
    });
}, 29 * 60 * 1000);

nextApp
  .prepare()
  .then(() => {
    app.use(compression());
    app.use(
      helmet({
        frameguard: false
      })
    );

    app.use(bodyParser.json({ limit: "5mb" }));
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use((req, res, next) => {
      const allowedOrigins = [
        "http://x.vainglory.eu",
        "https://x.vainglory.eu",
        "http://test.vainglory.eu",
        "https://test.vainglory.eu",
        "http://vain.zone",
        "https://vain.zone",
        "http://www.vain.zone",
        "https://www.vain.zone",
        "http://www.vainglory.eu",
        "http://vainglory.eu",
        "https://www.vainglory.eu",
        "https://vainglory.eu",
        "http://vz.vainglory.eu",
        "https://vz.vainglory.eu",
        "http://obscure-meadow-82712.herokuapp.com"
      ];

      if (dev) {
        allowedOrigins.unshift(`http://localhost:${PORT}`);
      }

      const origin = `${req.protocol}://${req.headers.host}`;

      if (req.protocol && req.headers.host) {
        if (allowedOrigins.indexOf(origin) > -1) {
          res.set("Access-Control-Allow-Origin", origin);
        }
      }
      //res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set("Access-Control-Allow-Headers", "Content-Type");
      //res.set('Access-Control-Allow-Credentials', true);

      //res.set("X-Frame-Options", `ALLOW-FROM ${origin}`);
      //.header alias to .set, .setHeader native NodeJS
      console.log(req.query, `${req.protocol}://${req.headers.host}`);

      return next();
    });

    app.get("/", (req, res) => {
      nextApp.render(req, res, "/extension", {
        browserView: true,
        setting: req.query.setting,
        ui: req.query.ui
      });
    });
    app.get("/player/:IGN", (req, res) => {
      nextApp.render(req, res, "/extension", {
        IGN: req.params.IGN,
        browserView: true,
        setting: req.query.setting,
        ui: req.query.ui
      });
    });

    app.use("/extension", extension(nextApp));
    app.use("/draft", draft(nextApp));
    app.use("/api", api);

    app.get("/top/en", (_, res) => {
      res.redirect(`/api/percentrank/en`);
    });
    app.get("/top/en/:IGN", (req, res) => {
      res.redirect(`/api/percentrank/en/${req.params.IGN}`);
    });
    app.get("/top/:IGN", (req, res) => {
      res.redirect(`/api/percentrank/${req.params.IGN}`);
    });

    app.get("*", (req, res) => {
      return nextHandler(req, res);
    });

    http.listen(PORT, (err: any) => {
      if (err) throw err;
      console.log("> Ready on http://localhost:" + PORT);
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
