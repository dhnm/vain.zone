const express = require("express");
const router = express.Router();

const axios = require("axios");

module.exports = router;

router.get("/", (req, res) => {
    axios({
        method: "get",
        url: JSON.parse(req.query.match).telemetryURL,
        headers: {
            "Content-Encoding": "gzip",
            "Content-Type": "application/json",
            "User-Agent": "js/vainglory",
            "X-TITLE-ID": "semc-vainglory",
            Accept: "application/json"
        },
        responseType: "json"
    })
        .then(response => {
            console.log("obtaining telemetry with status", response.status);
            return response.data;
        })
        .then(telemetryData => {
            const damagesData = calculateDamagesFromTelemetry(
                telemetryData,
                JSON.parse(req.query.match)
            );

            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.write(JSON.stringify({ damagesData: damagesData }));
            res.end();
        })
        .catch(function(error) {
            res.writeHead(404, {
                "Content-Type": "application/json"
            });
            res.write(
                JSON.stringify({
                    error: "Error retrieving telemetry"
                })
            );
            res.end();

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx

                if (error.response.status == 404) {
                    console.log(
                        `${JSON.stringify(error.response.data)} ${
                            error.response.status
                        } ${JSON.stringify(error.response.headers)}`
                    );
                }

                console.log(
                    `${JSON.stringify(error.response.data)} ${
                        error.response.status
                    } ${JSON.stringify(error.response.headers)}`
                );
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message);
            }
            console.log(error.config);
        });
});

const calculateDamagesFromTelemetry = (telemetry, match) => {
    const data = {};
    data.rosters = match.rosters;
    data.telemetry = telemetry;

    const rosters = [{}, {}];
    var highest = 0;

    for (
        var rosterIndex = 0;
        rosterIndex < data.rosters.length;
        rosterIndex++
    ) {
        for (
            var participantIndex = 0;
            participantIndex < data.rosters[rosterIndex].participants.length;
            participantIndex++
        ) {
            const totalDamage = data.telemetry
                .filter(
                    e =>
                        e.type === "DealDamage" &&
                        e.payload.Actor ===
                            "*" +
                                data.rosters[rosterIndex].participants[
                                    participantIndex
                                ].actor +
                                "*" &&
                        e.payload.Team == ["Left", "Right"][rosterIndex]
                )
                .map(e => e.payload.Dealt)
                .reduce((a, b) => a + b, 0);

            if (totalDamage > highest) {
                highest = totalDamage;
            }

            rosters[rosterIndex][
                data.rosters[rosterIndex].participants[participantIndex].actor
            ] = totalDamage;
        }
    }

    return { rosters: rosters, highest: highest };
};
