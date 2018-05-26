"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const axios_1 = require("axios");
const constants_1 = require("./../functions/constants");
exports.default = router;
router.get('/', (req, res) => {
    const matchData = JSON.parse(req.query.match);
    axios_1.default({
        method: 'get',
        url: matchData.telemetryURL,
        headers: {
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'User-Agent': 'js/vainglory',
            'X-TITLE-ID': 'semc-vainglory',
            Accept: 'application/json',
        },
    })
        .then((response) => {
        console.log('obtaining telemetry with status', response.status);
        return response.data;
    })
        .then((telemetryData) => {
        const damageData = calculateDamagesFromTelemetry(telemetryData, matchData);
        const banData = detectBans(telemetryData);
        getRankPoints(matchData).then((rankPoints) => {
            const output = {
                damageData: damageData,
                banData: banData,
                rankPoints: rankPoints,
                error: false,
            };
            res.writeHead(200, {
                'Content-Type': 'application/json',
            });
            res.write(JSON.stringify(output));
            res.end();
        });
    })
        .catch(function (error) {
        const output = {
            error: true,
        };
        res.writeHead(404, {
            'Content-Type': 'application/json',
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
            console.log('Error', error.message);
        }
        console.log(error.config);
    });
});
const calculateDamagesFromTelemetry = (telemetry, match) => {
    const damagesData = { rosters: [{}, {}], highest: 0 };
    for (let rosterIndex = 0; rosterIndex < match.rosters.length; rosterIndex++) {
        for (let participantIndex = 0; participantIndex < match.rosters[rosterIndex].participants.length; participantIndex++) {
            const totalDamage = telemetry
                .filter((e) => e.type === 'DealDamage' &&
                e.payload.Actor ===
                    '*' +
                        match.rosters[rosterIndex].participants[participantIndex]
                            .actor +
                        '*' &&
                e.payload.Team == ['Left', 'Right'][rosterIndex])
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
    telemetry.filter((e) => e.type == 'HeroBan').forEach((e) => {
        rostersBans[parseInt(e.payload.Team) - 1].push(e.payload.Hero.substring(1, e.payload.Hero.length - 1));
    });
    const bansData = { rosters: rostersBans };
    return bansData;
};
const getRankPoints = (matchData) => {
    return axios_1.default({
        method: 'get',
        url: `https://api.dc01.gamelockerapp.com/shards/${matchData.shardId}/matches/${matchData.matchID}`,
        headers: {
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'User-Agent': 'js/vainglory',
            Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxYWIwYmFhMC0xZTYxLTAxMzYtNGMyOC0wYTU4NjQ2MDBlZGYiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTIzMzA1MTE1LCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiJ2YWluLXpvbmUiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.WRRbcDammhPrqWhDPenutkXJdCbGv3CpxvwscPyQK9Y',
            'X-TITLE-ID': 'semc-vainglory',
            Accept: 'application/vnd.api+json',
        },
    })
        .then((response) => {
        console.log('obtaining single match data with status', response.status);
        return response.data;
    })
        .then((match) => {
        const rankPoints = {};
        for (let rosterIndex = 0; rosterIndex < matchData.rosters.length; rosterIndex++) {
            const currentRoster = matchData.rosters[rosterIndex];
            for (let participantIndex = 0; participantIndex < currentRoster.participants.length; participantIndex++) {
                const currentParticipant = currentRoster.participants[participantIndex];
                const player = match.included.find((e) => e.id === currentParticipant.player.id);
                rankPoints[currentParticipant.player.name] =
                    player.attributes.stats.rankPoints[constants_1.gameModeDict[matchData.gameMode][2]];
            }
        }
        return rankPoints;
    })
        .catch((error) => {
        console.error(error);
        return {};
    });
};
//# sourceMappingURL=telemetry.js.map