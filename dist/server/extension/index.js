"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const Match_1 = require("./../../models/Match");
const messenger_1 = require("./messenger");
const axios_1 = require("axios");
exports.default = (nextApp) => {
    router.get("/", (req, res) => {
        nextApp.render(req, res, "/extension", {
            error: false,
            extension: true
        });
    });
    router.get("/player/:IGN", (req, res) => {
        nextApp.render(req, res, "/extension", {
            IGN: req.params.IGN,
            error: false,
            extension: false
        });
    });
    router.get("/player/:IGN/:matchID", (req, res) => {
        let matchData = undefined;
        Match_1.Match.findOne({ matchID: req.params.matchID })
            .exec()
            .then(match => {
            if (match) {
                const aMonth = new Date(new Date().setDate(new Date().getDate() - 27));
                if (new Date(match.createdAt) > aMonth && match.telemetryURL) {
                    matchData = match;
                }
                return axios_1.default(`${req.protocol}://${req.headers.host}/api/telemetry?match=${JSON.stringify(matchData)}`);
            }
            else {
                throw new Error("404");
            }
        })
            .then(axiosData => {
            nextApp.render(req, res, "/extension", {
                IGN: req.params.IGN,
                error: false,
                extension: false,
                matchData: {
                    match: matchData,
                    TLData: axiosData.data
                }
            });
        })
            .catch(err => {
            console.error(err.message);
            nextApp.render(req, res, "/extension", {
                IGN: req.params.IGN,
                error: false,
                extension: false
            });
        });
    });
    router.use("/messenger", messenger_1.default);
    return router;
};
//# sourceMappingURL=index.js.map