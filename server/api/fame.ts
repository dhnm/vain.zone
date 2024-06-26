import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
import cacheMW from "./../../functions/cacheMW";

import { Router } from "express";
const router = Router();
import * as mcache from "memory-cache";

import axios from "axios";

import { Match } from "./../../models/Match";
import { Guild } from "./../../models/Guild";

import { gameModeDict } from "./../../functions/constants";

export default router;

router.get("/edit", cacheMW(60), (req, res) => {
    Guild.findById(req.query.id)
        .then(guild => {
            if (guild) {
                res.json(guild);
            } else {
                res.status(404).json({ error: true, message: 404 });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: true, message: err });
        });
});

router.post("/edit", (req, res) => {
    Guild.findById(req.body.guildID)
        .then(guild => {
            if (guild) {
                if (req.body.data.key === guild.key) {
                    Object.assign(guild, req.body.data);
                    guild.save();
                    res.json({ success: true });
                } else {
                    res.status(401).json({ error: true, message: 401 });
                }
            } else {
                res.status(404).json({ error: true, message: 404 });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: true, message: err.message });
        });
});

router.post("/", (req, res) => {
    axios
        .post(serverRuntimeConfig.discordGuildApplicationWebhookURL, {
            content: `\n**New Guild Application**\n\n**Guild Name:** ${
                req.body.guildName
            }\n**Guild Tag:** ${req.body.guildTag}\n**Contact:** ${
                req.body.contact
            }\n**Guild Members:** ${req.body.guildMembers}`,
            avatar_url: "https://vain.zone/static/img/draft/logo.png"
        })
        .then(() => res.json({ success: true }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: true, message: err.message });
        });
});

router.get("/", (req, res) => {
    // counts from Sunday to Saturday, on Sunday shows data from previous 7 days
    const date = new Date();
    const day = date.getDay();
    const prevSaturday = new Date().setDate(date.getDate() - 7 + 6 - day);
    const endPrevSaturday = new Date(
        new Date(prevSaturday).setHours(23, 59, 59, 999)
    );

    const guildID = req.query.id;

    const cachedBody = mcache.get(`guild/${guildID}`);

    if (
        cachedBody &&
        cachedBody.lastUpdated >= endPrevSaturday &&
        !req.query.clearCache
    ) {
        console.log(`Serving cached data from ${cachedBody.lastUpdated}`);
        res.json(cachedBody);
    } else {
        const prevSunday = new Date().setDate(date.getDate() - 7 - day);
        const startPrevSunday = new Date(
            new Date(prevSunday).setHours(0, 0, 0, 0)
        );

        if (!guildID) {
            getBARPAFame(startPrevSunday, endPrevSaturday)
                .then(fames => {
                    res.json(fames);
                    mcache.put(`guild/${guildID}`, fames);
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: true, errorMessage: err });
                    //res.status(500).json({ error: true, errorMessage: err });
                });
        } else {
            Guild.findById(guildID)
                .then(guild => {
                    if (guild) {
                        return processGuild(
                            startPrevSunday,
                            endPrevSaturday,
                            guild.members
                        ).then(fames => ({
                            name: guild.name,
                            tag: guild.tag,
                            lastUpdated: fames.lastUpdated,
                            members: fames.members.filter(
                                e => guild.members.indexOf(e.name) > -1
                            )
                        }));
                    } else {
                        throw new Error("404");
                    }
                })
                .then(fames => {
                    res.json(fames);
                    mcache.put(`guild/${guildID}`, fames);
                })
                .catch(err => {
                    if (err.message == "404") {
                        res
                            .status(404)
                            .json({ error: true, errorMessage: 404 });
                    } else {
                        console.error(err);
                        res
                            .status(500)
                            .json({ error: true, errorMessage: err });
                    }
                });
        }
    }
});

function getBARPAFame(start, end) {
    return Guild.find({ contact: "info@vainglory.eu" })
        .exec()
        .then(guilds => {
            if (guilds.length === 2) {
                return processGuild(
                    start,
                    end,
                    guilds[0].members.concat(guilds[1].members)
                )
                    .then(fames => ({
                        name: "Blue Oyster Bar",
                        tag: "BAR",
                        lastUpdated: fames.lastUpdated,
                        members: fames.members.filter(
                            e => guilds[0].members.indexOf(e.name) > -1
                        ),
                        academy: fames.members.filter(
                            e => guilds[1].members.indexOf(e.name) > -1
                        )
                    }))
                    .catch(err => Promise.reject(err));
            } else {
                return Promise.reject("CZ Guilds not found.");
            }
        })
        .catch(err => Promise.reject(err));
}

const processGuild = (start, end, guildArray) => {
    const guildAggregations = [];

    for (let i = 0; i < guildArray.length; i++) {
        guildAggregations.push(
            aggregateFunc(start, end, guildArray[i], guildArray)
        );
    }

    return Promise.all(guildAggregations).then(playerStats => {
        const fames = [];
        for (let pi = 0; pi < playerStats.length; pi++) {
            const name = guildArray[pi];
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

        return {
            lastUpdated: end,
            members: fames.sort((a, b) => b.fame - a.fame)
        };
    });
};

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
