"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = require("express")();
const morgan = require("morgan");
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
const axios_1 = require("axios");
const extension_1 = require("./../modules/extension");
const draft_1 = require("./../modules/draft");
const api_1 = require("./../modules/api");
// import { Match } from "./../models/Match";
// import { Player } from "./../models/Player";
// import { CzSk } from './../models/CzSk';
mongoose.connect("mongodb://user_thisBoy:r8LspGn5jpZJIfCP@vainzone-shard-00-00-jem9k.mongodb.net:27017,vainzone-shard-00-01-jem9k.mongodb.net:27017,vainzone-shard-00-02-jem9k.mongodb.net:27017/VAINZONE?ssl=true&replicaSet=VAINZONE-shard-0&authSource=admin");
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
        if (rooms[roomIDWithoutNamespace] &&
            rooms[roomIDWithoutNamespace].sockets[roomIDWithoutNamespace]) {
            socket.to(data.keys.recipientID).emit("verify", data);
        }
        else {
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
    axios_1.default({
        method: "get",
        url: "https://vain.zone/"
    })
        .then(response => {
        console.log("here1", response);
    })
        .catch(function (error) {
        console.error(error);
    });
}, 29 * 60 * 1000);
nextApp
    .prepare()
    .then(() => {
    app.use(morgan("combined"));
    app.use(compression());
    app.use(helmet({
        frameguard: false
    }));
    app.use(bodyParser.json({ limit: "5mb" }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use((req, res, callback) => {
        var allowedOrigins = [
            "http://localhost:3000",
            "https://localhost:3000",
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
            "https://vainglory.eu"
        ];
        var origin = req.headers.origin;
        if (typeof origin === "string") {
            if (allowedOrigins.indexOf(origin) > -1) {
                res.setHeader("Access-Control-Allow-Origin", origin);
            }
        }
        else if (origin instanceof Array) {
            const duplicates = allowedOrigins.filter((val) => {
                return origin.indexOf(val) != -1;
            });
            if (duplicates.length > 0) {
                res.setHeader("Access-Control-Allow-Origin", origin);
            }
        }
        //res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        //res.header('Access-Control-Allow-Credentials', true);
        res.setHeader("X-Frame-Options", `ALLOW-FROM ${origin}`);
        return callback();
    });
    app.get("/", (req, res) => {
        nextApp.render(req, res, "/extension/player", {
            browserView: true
        });
    });
    app.get("/player/:IGN", (req, res) => {
        nextApp.render(req, res, "/extension/player", {
            IGN: req.params.IGN,
            browserView: true
        });
    });
    app.use("/extension", extension_1.default(nextApp));
    app.use("/draft", draft_1.default(nextApp));
    app.use("/api", api_1.default);
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
    http.listen(PORT, (err) => {
        if (err)
            throw err;
        console.log("> Ready on http://localhost:" + PORT);
    });
})
    .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
});
//# sourceMappingURL=index.js.map