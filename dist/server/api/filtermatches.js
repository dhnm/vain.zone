"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("next/config");
const { serverRuntimeConfig } = config_1.default();
const cacheMW_1 = require("./../../functions/cacheMW");
const express_1 = require("express");
const router = express_1.Router();
const getData_1 = require("./../../functions/getData");
exports.default = router;
router.get("/", cacheMW_1.default(60), (req, res) => {
    let filters;
    try {
        filters = JSON.parse(req.query.filters);
        if (!filters || !req.query.shardId || !req.query.playerID) {
            throw new Error("Missing request arguments.");
        }
        filters.matches = filters.matches > 0 ? filters.matches : 12;
    }
    catch (error) {
        console.error(error);
        res.status(400).end();
        return;
    }
    const createdAt = filters.createdAt ? new Date(filters.createdAt) : undefined;
    if (createdAt) {
        createdAt.setSeconds(createdAt.getSeconds() - 1);
    }
    getData_1.axiosAPI({
        shardId: req.query.shardId,
        endPoint: "matches",
        params: {
            "filter[createdAt-end]": createdAt,
            "page[limit]": filters.matches,
            sort: "-createdAt",
            "filter[playerIds]": req.query.playerID,
            "filter[gameMode]": filters.gameMode
        },
        key: req.gloryStatsKey || serverRuntimeConfig.filterApiKey
    })
        .then(matchesData => {
        if (matchesData) {
            const matches = matchesData.data.reduce((accu, m) => {
                const formattedMatch = getData_1.formatMatch(m, matchesData.included);
                if (formattedMatch) {
                    accu.push(formattedMatch);
                }
                return accu;
            }, []);
            res.json({ matches });
            getData_1.insertMatchesToDB(matches).catch(err => console.error(err));
        }
        else {
            res.status(404).end();
        }
    })
        .catch(err => {
        console.error(err.message);
        res.status(404).end();
    });
});
//# sourceMappingURL=filtermatches.js.map