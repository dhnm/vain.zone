"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const getData_1 = require("./../functions/getData");
const skillTierCalculator_1 = require("./../functions/skillTierCalculator");
const constants_1 = require("./../functions/constants");
exports.default = router;
router.get("/", (_, res) => {
    const playerID = "682fecfc-d732-11e6-9b38-06388a2f2ea7";
    const axiosArray = [];
    for (let i = 0; i < 10; i++) {
        axiosArray.push(getData_1.axiosAPI({
            shardId: "eu",
            endPoint: "matches",
            params: {
                "page[offset]": i,
                "page[limit]": 1,
                sort: "-createdAt",
                "filter[playerIds]": playerID,
                "filter[gameMode]": "5v5_pvp_ranked"
                // "filter[createdAt-start]": "2018-06-15T12:36:00Z", // delet
                // "filter[createdAt-end]": "2018-06-22T12:36:00Z"
            },
            key: constants_1.testingApiKey
        }).catch(e => ({ e })));
    }
    Promise.all(axiosArray)
        .then(axiosData => {
        const retrievedData = axiosData.filter(e => !e.e).map(e => {
            const player = e.included.find(e2 => e2.id === playerID);
            return {
                name: player.attributes.name,
                rankPoints: player.attributes.stats.rankPoints.ranked_5v5,
                createdAt: e.data[0].attributes.createdAt
            };
        });
        const output = retrievedData.map((data, i) => {
            const processed = skillTierCalculator_1.default(data.rankPoints);
            const diff = retrievedData[i - 1]
                ? retrievedData[i - 1].rankPoints - data.rankPoints
                : undefined;
            return {
                name: data.name,
                from: data.createdAt,
                rankPoints: data.rankPoints,
                rank: `${processed.name} ${processed.color}`,
                elo_gain: diff
            };
        });
        const result = { length: output.length, output };
        res.json(result);
    })
        .catch(err => {
        console.error(err);
        res.json({ error: true });
    });
});
//# sourceMappingURL=testing.js.map