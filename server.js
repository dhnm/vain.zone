const express = require("express");
const next = require("next");
const helmet = require("helmet");

const extension = require("./modules/extension");
const api = require("./modules/api");

const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const axios = require("axios");

const mongoose = require("mongoose");
mongoose.connect(
    "mongodb://user_thisBoy:r8LspGn5jpZJIfCP@vainzone-shard-00-00-jem9k.mongodb.net:27017,vainzone-shard-00-01-jem9k.mongodb.net:27017,vainzone-shard-00-02-jem9k.mongodb.net:27017/VAINZONE?ssl=true&replicaSet=VAINZONE-shard-0&authSource=admin"
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("We're connected!");

    // BotUser.insertMany(transformedData, { ordered: true })
    //     .then(u => console.log("Inserted " + u.length + " users."))
    //     .catch(err => console.error("Error inserting people", err));

    // BotUser.deleteMany({})
    //     .exec()
    //     .then(deleted => console.log("deleted", deleted))
    //     .catch(err => console.error("error modifying", err));

    // Player.find({ id: "5ad169e94a085e75ca6f1b0b" })
    //   .exec()
    //   .then(founds => {
    //     founds.forEach(found => {
    //       found.id = mongoose.Types.ObjectId().toHexString();

    //       found
    //         .save()
    //         .then(saved => console.log("saved", saved.id))
    //         .catch(err => console.log("err2" + err));
    //     });
    //   })
    //   .catch(err => console.log("err1" + err));
});

setInterval(() => {
    axios({
        method: "get",
        url: "https://test.vainglory.eu/"
    })
        .then(response => {
            console.log("here1", response);
        })
        .catch(function(error) {
            console.error(error);
        });
}, 29 * 60 * 1000);

app
    .prepare()
    .then(() => {
        const server = express();

        server.use(helmet());
        server.use(bodyParser.json({ limit: "5mb" }));

        server.use((req, res, callback) => {
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
                "https://www.vain.zone"
            ];
            var origin = req.headers.origin;
            if (allowedOrigins.indexOf(origin) > -1) {
                res.setHeader("Access-Control-Allow-Origin", origin);
            }
            //res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            //res.header('Access-Control-Allow-Credentials', true);

            return callback();
        });

        server.use("/extension", extension(app));
        server.use("/api", api);

        server.get("/", (req, res) => {
            res.send("Coming soon.");
        });

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
