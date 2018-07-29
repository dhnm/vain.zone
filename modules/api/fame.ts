import { Router } from "express";
const router: Router = Router();
import * as mcache from "memory-cache";

import axios from "axios";

import { Match } from "./../../models/Match";
import { gameModeDict } from "./../functions/constants";

export default router;

router.post("/", (req, res) => {
    axios
        .post(
            "https://discordapp.com/api/webhooks/378865484344459264/ivZIqgRY9TL2y5Q1X8uh78RBEA03OeIksArPnhEvAIv7xQSoheS_NvCiAtHUVEEfleBv",
            {
                content: `**New Guild Application**\n\n**Guild Name:** ${
                    req.body.guildName
                }\n**Guild Tag:** ${req.body.guildTag}\n**Contact:** ${
                    req.body.contact
                }\n**Guild Members:** ${req.body.guildMembers}`,
                avatar_url: "https://vain.zone/static/img/draft/logo.png"
            }
        )
        .then(() => res.json({ success: true }))
        .catch(err => {
            console.error(err);
            res.json({ error: true });
        });
});

router.get("/", (_, res): void => {
    // counts from Sunday to Saturday, on Sunday shows data from previous 7 days
    const date = new Date();
    const day = date.getDay();
    const prevSaturday = new Date().setDate(date.getDate() - 7 + 6 - day);
    const endPrevSaturday = new Date(
        new Date(prevSaturday).setHours(23, 59, 59, 999)
    );

    const cachedBody = mcache.get("guild/Blue Oyster Bar");

    if (cachedBody && cachedBody.lastUpdated >= endPrevSaturday) {
        console.log(`Serving cached data from ${cachedBody.lastUpdated}`);
        res.json(cachedBody);
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
            "nicolepipes"
        ];

        const academyArray = [
            "mio007",
            "krutypeta",
            "Vykuchator",
            "brouk",
            "pralinka",
            "Bloshatup",
            "EricLassard",
            "LuckyReaperCZ",
            "Pa3k420",
            "ARA666",
            "LegendHeroCZ",
            "danOne",
            "SimplyPerfect",
            "Gargoron"
        ];

        const guildAggregations = [];

        for (let i = 0; i < guildArray.length; i++) {
            guildAggregations.push(
                aggregateFunc(
                    startPrevSunday,
                    endPrevSaturday,
                    guildArray[i],
                    guildArray
                )
            );
        }

        const academyAggregations = [];

        for (let i = 0; i < academyArray.length; i++) {
            academyAggregations.push(
                aggregateFunc(
                    startPrevSunday,
                    endPrevSaturday,
                    academyArray[i],
                    guildArray.concat(academyArray)
                )
            );
        }

        Promise.all(guildAggregations.concat(academyAggregations))
            .then(playerStats => {
                const fames = [];
                for (let pi = 0; pi < playerStats.length; pi++) {
                    const name =
                        guildArray[pi] || academyArray[pi - guildArray.length];
                    if (playerStats[pi].length === 0) {
                        fames.push({
                            name,
                            fame: 0
                        });
                    } else {
                        fames.push({
                            name,
                            fame: Math.floor(
                                playerStats[pi].reduce((accu, currVa) => {
                                    const matchFame =
                                        gameModeDict[currVa._id.gameMode][3][
                                            currVa._id.mates - 1
                                        ] * currVa.count;
                                    if (currVa._id.won) {
                                        return accu + matchFame;
                                    }
                                    return accu + matchFame * 0.75;
                                }, 0)
                            )
                        });
                    }
                }

                const result = {
                    lastUpdated: endPrevSaturday,
                    guild: fames
                        .slice(0, guildArray.length)
                        .sort((a, b) => b.fame - a.fame),
                    academy: fames
                        .slice(guildArray.length)
                        .sort((a, b) => b.fame - a.fame)
                };
                res.json(result);
                mcache.put("guild/Blue Oyster Bar", result);
            })
            .catch(err => {
                res.json({ error: err });
            });
    }
});

function aggregateFunc(start, end, name, guildMembers) {
    return Match.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: start,
                    $lte: end
                },
                "rosters.participants.player.name": name,
                gameMode: {
                    $in: [
                        "5v5_pvp_ranked",
                        "5v5_pvp_casual",
                        "ranked",
                        "casual",
                        "casual_aral",
                        "blitz_pvp_ranked"
                    ]
                }
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
                "rosters.participants.player.name": name
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
                            $setIntersection: ["$mates", guildMembers]
                        }
                    }
                },
                count: {
                    $sum: 1.0
                }
            }
        }
    ]).exec();
}
