"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const axios_1 = require("axios");
exports.default = router;
router.get("/", (req, res) => {
    axios_1.default({
        method: "get",
        url: JSON.parse(req.query.match).telemetryURL,
        headers: {
            "Content-Encoding": "gzip",
            "Content-Type": "application/json",
            "User-Agent": "js/vainglory",
            "X-TITLE-ID": "semc-vainglory",
            Accept: "application/json"
        }
    })
        .then((response) => {
        console.log("obtaining telemetry with status", response.status);
        return response.data;
    })
        .then((telemetryData) => {
        const damageData = calculateDamagesFromTelemetry(telemetryData, JSON.parse(req.query.match));
        const banData = detectBans(telemetryData);
        const output = {
            damageData: damageData,
            banData: banData,
            error: false
        };
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.write(JSON.stringify(output));
        res.end();
    })
        .catch(function (error) {
        const output = {
            error: true
        };
        res.writeHead(404, {
            "Content-Type": "application/json"
        });
        res.write(JSON.stringify(output));
        res.end();
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status == 404) {
                console.log(`${JSON.stringify(error.response.data)} ${error.response.status} ${JSON.stringify(error.response.headers)}`);
            }
            console.log(`${JSON.stringify(error.response.data)} ${error.response.status} ${JSON.stringify(error.response.headers)}`);
        }
        else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
        }
        else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
        }
        console.log(error.config);
    });
});
const calculateDamagesFromTelemetry = (telemetry, match) => {
    const damagesData = { rosters: [{}, {}], highest: 0 };
    for (let rosterIndex = 0; rosterIndex < match.rosters.length; rosterIndex++) {
        for (let participantIndex = 0; participantIndex < match.rosters[rosterIndex].participants.length; participantIndex++) {
            const totalDamage = telemetry
                .filter((e) => e.type === "DealDamage" &&
                e.payload.Actor ===
                    "*" +
                        match.rosters[rosterIndex].participants[participantIndex]
                            .actor +
                        "*" &&
                e.payload.Team == ["Left", "Right"][rosterIndex])
                .map((e) => e.payload.Dealt)
                .reduce((a, b) => a + b, 0);
            if (totalDamage > damagesData.highest) {
                damagesData.highest = totalDamage;
            }
            damagesData.rosters[rosterIndex][match.rosters[rosterIndex].participants[participantIndex].actor] = totalDamage;
        }
    }
    return damagesData;
};
const detectBans = (telemetry) => {
    const rostersBans = [[], []];
    telemetry.filter((e) => e.type == "HeroBan").forEach((e) => {
        rostersBans[parseInt(e.payload.Team) - 1].push(e.payload.Hero.substring(1, e.payload.Hero.length - 1));
    });
    const bansData = { rosters: rostersBans };
    return bansData;
};
//# sourceMappingURL=telemetry.js.map