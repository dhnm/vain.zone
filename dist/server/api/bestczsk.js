"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const cacheMW_1 = require("./../../functions/cacheMW");
const Player_1 = require("./../../models/Player");
const CzSk_1 = require("./../../models/CzSk");
const getData_1 = require("./../../functions/getData");
const skillTierCalculator_1 = require("./../../functions/skillTierCalculator");
exports.default = router;
const output = players => {
    players.forEach(p => (p.processedRankPoints = skillTierCalculator_1.default(p.rank_5v5)));
    return {
        byRank: players
            .map(p => ({
            name: p.name,
            rankPoints: p.rank_5v5,
            mixedRank: `${p.processedRankPoints.number}${p.processedRankPoints.color}`,
            lastUpdated: p.czSk.retrieval
        }))
            .sort((a, b) => b.rankPoints - a.rankPoints),
        byGrowth: players
            .map(p => {
            let growthPoints = (p.rank_5v5 - p.czSk.first_of_month) *
                Math.sqrt(p.processedRankPoints.skillTier) +
                p.rank_5v5 / 77;
            if (p.rank_5v5 > 2400 && p.czSk.first_of_month < 2400) {
                growthPoints =
                    (p.rank_5v5 - p.czSk.first_of_month) * Math.sqrt(26.26) +
                        p.rank_5v5 / 77 +
                        (p.rank_5v5 - 2400) *
                            (Math.sqrt(p.processedRankPoints.skillTier) * 2 - // * 4 eventually
                                Math.sqrt(26));
            }
            growthPoints = (growthPoints * 10) / 3;
            return { name: p.name, growthPoints };
        })
            .sort((a, b) => b.growthPoints - a.growthPoints)
    };
};
router.get("/", cacheMW_1.default(64800), (_, res) => {
    CzSk_1.CzSk.find({})
        .exec()
        .then(czSkPlayers => Player_1.Player.find({
        name: { $in: czSkPlayers.map(p => p.name) }
    }).exec())
        .then(players => {
        if (players && players.length > 0) {
            const toBeUpdated = [];
            const now = new Date();
            players.forEach(p => {
                if (!p.czSk)
                    p.czSk = {};
                const czSkRetrievalDate = new Date(p.czSk.retrieval);
                if (!p.czSk.retrieval ||
                    p.czSk.of_month != now.getMonth() ||
                    czSkRetrievalDate.setDate(czSkRetrievalDate.getDate() + 1) <=
                        now.getTime()) {
                    toBeUpdated.push(p);
                }
            });
            const requestLimit = 7;
            toBeUpdated
                .sort((a, b) => b.rank_5v5 - a.rank_5v5)
                .splice(6 * requestLimit, toBeUpdated.length - 6 * requestLimit);
            // can call 6 names in one request
            const axiosArray = [];
            for (let i = 0; i < toBeUpdated.length / 6; i++) {
                axiosArray.push(getData_1.axiosAPI({
                    shardId: "eu",
                    endPoint: "players",
                    params: {
                        "filter[playerIds]": toBeUpdated
                            .slice(i * 6, i * 6 + 5)
                            .map(e => e.playerID)
                            .join(",")
                    }
                }));
            }
            Promise.all(axiosArray)
                .then(axiosData => {
                // const freshPlayerData = [].concat(
                //   ...axiosData.map((e) => e.data),
                // );
                const freshPlayerData = [].concat(...axiosData.map(e => e.data));
                freshPlayerData.forEach(e => {
                    const relevantPlayer = toBeUpdated.find(p => p.playerID === e.id);
                    if (e.attributes.patchVersion >= "3.9") {
                        relevantPlayer.rank_5v5 =
                            e.attributes.stats.rankPoints.ranked_5v5;
                        if (relevantPlayer.czSk.of_month != now.getMonth() ||
                            relevantPlayer.czSk.first_of_month === 9999) {
                            relevantPlayer.czSk.of_month = now.getMonth();
                            relevantPlayer.czSk.first_of_month =
                                e.attributes.stats.rankPoints.ranked_5v5 >= 1090
                                    ? e.attributes.stats.rankPoints.ranked_5v5
                                    : 1090;
                        }
                    }
                    else {
                        relevantPlayer.rank_5v5 = 0;
                        if (relevantPlayer.czSk.of_month != now.getMonth()) {
                            relevantPlayer.czSk.of_month = now.getMonth();
                            relevantPlayer.czSk.first_of_month = 9999;
                        }
                    }
                    relevantPlayer.czSk.retrieval = now;
                    relevantPlayer.save();
                });
                res.json(output(players));
            })
                .catch(err => {
                console.error(err);
                res.json(output(players));
            });
        }
        else {
            res.status(404).end();
        }
    })
        .catch(err => {
        console.error(err);
        res.status(500).end();
    });
});
//# sourceMappingURL=bestczsk.js.map