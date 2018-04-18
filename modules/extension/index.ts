const express = require("express");
const router = express.Router();

const messenger = require("./messenger");

module.exports = app => {
    router.get("/", (req, res) => {
        app.render(req, res, "/extension/player", {
            error: false,
            extension: true
        });
    });

    router.get("/player/:IGN", (req, res) => {
        app.render(req, res, "/extension/player", {
            IGN: req.params.IGN,
            error: false,
            extension: false
        });
    });

    router.use("/messenger", messenger);

    return router;
};
