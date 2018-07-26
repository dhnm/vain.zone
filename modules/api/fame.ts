import { Router } from "express";
const router: Router = Router();
import * as mcache from "memory-cache";

import { Match } from "./../../models/Match";
import { gameModeDict } from "./../functions/constants";

export default router;

router.get("/", (_, res): void => {
    // counts from Sunday to Saturday, on Sunday shows data from previous 7 days
    const date = new Date();
    const day = date.getDay();
    const prevSaturday = new Date().setDate(date.getDate() - 7 + 6 - day);
    const endPrevSaturday = new Date(
        new Date(prevSaturday).setHours(23, 59, 59, 999)
    );

    const cachedBody = mcache.get("fames/Blue Oyster Bar");

    if (cachedBody && cachedBody.lastUpdated >= endPrevSaturday) {
        console.log(`Serving cached data from ${cachedBody.lastUpdated}`);
        res.json(cachedBody.fames);
    } else {
        const prevSunday = new Date().setDate(date.getDate() - 7 - day);
        const startPrevSunday = new Date(
            new Date(prevSunday).setHours(0, 0, 0, 0)
        );

        const guildArray = [
            "Waren1x",
            "LookForward",
            "Modrey",
            "thisBoy",
            "RooninCz",
            "matys",
            "JendaaaK",
            "D3jv",
            "Zcepeli",
            "Snooky950",
            "xXDragonHellXx",
            "LookBack",
            "Dreamberry",
            "GreePixHD",
            "MrTiko",
            "adX",
            "CrazyDeimos",
            "Odysea001",
            "Nablonfare",
            "grostajl",
            "Anitka11",
            "mrazik",
            "88Peter88",
            "OhyCZ",
            "Vindy61",
            "Jakub1302",
            "festerkoo",
            "SumiSVK",
            "TrueRich",
            "Marnisar",
            "ElrathCZ",
            "BobyBrno",
            "Pesar",
            "DiginaltSVK",
            "lKalix3l",
            "EmPaT1C",
            "Agaver",
            "pinko727",
            "Mangeky",
            "Stone82",
            "AsAs1INI",
            "Samueliss",
            "ARMATA14",
            "killersdaniel",
            "Dubcenko",
            "jonplaya83",
            "JirkaNguyen",
            "bedna21",
            "SkerCZ",
            "Terrtan3"
        ];

        const aggregations = [];

        for (let i = 0; i < guildArray.length; i++) {
            aggregations.push(
                Match.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: startPrevSunday,
                                $lte: endPrevSaturday
                            },
                            "rosters.participants.player.name": guildArray[i]
                        }
                    },
                    {
                        $project: {
                            rosters: 1.0,
                            gameMode: 1.0,
                            endGameReason: 1.0
                        }
                    },
                    {
                        $unwind: "$rosters"
                    },
                    {
                        $match: {
                            "rosters.participants.player.name": guildArray[i]
                        }
                    },
                    {
                        $project: {
                            gameMode: 1.0,
                            endGameReason: 1.0,
                            won: "$rosters.won",
                            mates: "$rosters.participants.player.name"
                        }
                    },
                    {
                        $redact: {
                            $cond: [
                                {
                                    $and: [
                                        {
                                            $eq: ["$endGameReason", "surrender"]
                                        },
                                        {
                                            $eq: ["$won", false]
                                        }
                                    ]
                                },
                                "$$PRUNE",
                                "$$DESCEND"
                            ]
                        }
                    },
                    {
                        $group: {
                            _id: {
                                gameMode: "$gameMode",
                                won: "$won",
                                mates: {
                                    $size: {
                                        $setIntersection: ["$mates", guildArray]
                                    }
                                }
                            },
                            count: {
                                $sum: 1.0
                            }
                        }
                    }
                ]).exec()
            );
        }
        Promise.all(aggregations)
            .then(playerStats => {
                const fames = [];
                for (let pi = 0; pi < playerStats.length; pi++) {
                    if (playerStats[pi].length === 0) {
                        fames.push({
                            name: guildArray[pi],
                            fame: 0
                        });
                    } else {
                        fames.push({
                            name: guildArray[pi],
                            fame:
                                2 *
                                Math.floor(
                                    playerStats[pi].reduce((accu, currVa) => {
                                        if (
                                            gameModeDict[currVa._id.gameMode][3]
                                        ) {
                                            if (currVa._id.won) {
                                                return (
                                                    accu +
                                                    gameModeDict[
                                                        currVa._id.gameMode
                                                    ][3][currVa._id.mates - 1]
                                                );
                                            }
                                            return (
                                                accu +
                                                gameModeDict[
                                                    currVa._id.gameMode
                                                ][3][currVa._id.mates - 1] *
                                                    0.75
                                            );
                                        }
                                        return accu;
                                    }, 0)
                                )
                        });
                    }
                }
                fames.sort((a, b) => b.fame - a.fame);
                res.json(fames);
                mcache.put("fames/Blue Oyster Bar", {
                    lastUpdated: endPrevSaturday,
                    fames
                });
            })
            .catch(err => {
                res.json({ error: err });
            });
    }
});
