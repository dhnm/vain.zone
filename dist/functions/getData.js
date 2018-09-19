"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("next/config");
const { serverRuntimeConfig, publicRuntimeConfig } = config_1.default();
const axios_1 = require("axios");
const Player_1 = require("./../models/Player");
const Match_1 = require("./../models/Match");
function getData(params) {
    return new Promise((resolve, reject) => {
        let playerDataFromDB;
        let playerDataFromAPI;
        let matchesFromAPI;
        Player_1.Player.findOne(params.IGN ? { name: params.IGN } : { playerID: params.playerID })
            .exec()
            .then(player => {
            if (player) {
                playerDataFromDB = player;
                return getPlayerFromAPI({
                    playerID: player.playerID,
                    shardId: player.shardId
                });
            }
            return getPlayerFromAPI(params.playerID
                ? { playerID: params.playerID }
                : { IGN: params.IGN });
        })
            .then(player => {
            playerDataFromAPI = player;
            if (playerDataFromDB) {
                if (playerDataFromDB.name !== playerDataFromAPI.name) {
                    playerDataFromDB.IGNHistory.push(playerDataFromDB.name);
                    return Player_1.Player.updateOne({ name: playerDataFromAPI.name }, {
                        $unset: { name: "" },
                        $push: { IGNHistory: playerDataFromAPI.name }
                    })
                        .exec()
                        .catch(err => console.error(err));
                }
                return;
            }
            return Player_1.Player.findOne({
                playerID: playerDataFromAPI.playerID
            })
                .exec()
                .then(newDBPlayerData => {
                if (newDBPlayerData) {
                    if (newDBPlayerData.name) {
                        newDBPlayerData.IGNHistory.push(newDBPlayerData.name);
                    }
                    playerDataFromDB = newDBPlayerData;
                    // dbmatchesapi
                }
                return; // newplayer
            })
                .catch(err => {
                console.error(err);
                return Promise.resolve();
            });
        })
            .then(() => getUnfilteredMatchesData(playerDataFromAPI.playerID, playerDataFromAPI.shardId))
            .then(matches => {
            matchesFromAPI = matches;
            return insertMatchesToDB(matches);
        })
            .then(() => {
            if (params.messenger) {
                return Promise.resolve();
            }
            return aggregateData(playerDataFromAPI.playerID);
        })
            .then(playerMeta => {
            resolve({
                player: {
                    ...playerDataFromAPI,
                    playerMeta
                },
                matches: params.messenger
                    ? undefined
                    : matchesFromAPI.slice(0, 12)
            });
            updatePlayerDB(playerDataFromDB, playerDataFromAPI);
        })
            .catch(err => {
            console.error(err);
            reject(err);
        });
    });
}
exports.default = getData;
function getPlayerFromAPI(params) {
    return new Promise((resolve, reject) => {
        const regions = ["na", "eu", "sg", "sa", "ea", "cn"];
        if (params.shardId) {
            regions.unshift(regions.splice(regions.indexOf(params.shardId), 1)[0]);
        }
        const tryRegion = regionIndex => {
            axiosAPI({
                shardId: regions[regionIndex],
                endPoint: "players",
                params: params.IGN
                    ? {
                        "filter[playerNames]": params.IGN
                    }
                    : {
                        "filter[playerIds]": params.playerID
                    }
            })
                .then(json => {
                const data = json.data[0];
                let customPlayerDataModel;
                try {
                    customPlayerDataModel = {
                        playerID: data.id,
                        name: data.attributes.name,
                        shardId: data.attributes.shardId,
                        createdAt: data.attributes.createdAt,
                        patchVersion: data.attributes.patchVersion,
                        played_aral: data.attributes.stats.gamesPlayed.aral,
                        played_blitz: data.attributes.stats.gamesPlayed.blitz,
                        played_casual: data.attributes.stats.gamesPlayed.casual,
                        played_ranked: data.attributes.stats.gamesPlayed.ranked,
                        played_casual_5v5: data.attributes.stats.gamesPlayed.casual_5v5,
                        played_ranked_5v5: data.attributes.stats.gamesPlayed.ranked_5v5,
                        guildTag: data.attributes.stats.guildTag,
                        karmaLevel: data.attributes.stats.karmaLevel,
                        level: data.attributes.stats.level,
                        rank_3v3: data.attributes.stats.rankPoints.ranked,
                        rank_5v5: data.attributes.stats.rankPoints.ranked_5v5,
                        rank_blitz: data.attributes.stats.rankPoints.blitz
                    };
                }
                catch (err) {
                    console.error(err);
                    return reject(new Error("veryold"));
                }
                if (customPlayerDataModel.patchVersion < "3.2") {
                    // 3.2 up features 5v5 ranked
                    return reject(new Error("veryold"));
                }
                return resolve(customPlayerDataModel);
            })
                .catch(err => {
                if (regionIndex + 1 === regions.length) {
                    return reject(err);
                }
                console.log(`${params.IGN || params.playerID} not found in ${regions[regionIndex]}.`);
                tryRegion(regionIndex + 1);
            });
        };
        tryRegion(0);
    });
}
function getUnfilteredMatchesData(playerID, shardId) {
    return axiosAPI({
        shardId,
        endPoint: "matches",
        params: {
            "page[offset]": 0,
            "page[limit]": 50,
            sort: "-createdAt",
            "filter[playerIds]": playerID
        }
    })
        .then(matchesData => matchesData.data.reduce((accu, m) => {
        const formattedMatch = formatMatch(m, matchesData.included);
        if (formattedMatch) {
            accu.push(formattedMatch);
        }
        return accu;
    }, []))
        .catch(err => {
        console.error(err);
        if (err.message == "404") {
            throw new Error("veryold");
        }
        throw err;
    });
}
function insertMatchesToDB(matches) {
    return Match_1.Match.insertMany(matches, {
        ordered: false
    }).catch(err => {
        if (err.code !== 11000) {
            throw new Error("500");
        }
        return;
    });
}
exports.insertMatchesToDB = insertMatchesToDB;
function aggregateData(playerID) {
    return Promise.all([
        Match_1.Match.aggregate([
            {
                $match: {
                    patchVersion: {
                        $gte: publicRuntimeConfig.currentSeasonPatch
                    },
                    "rosters.participants.player.playerID": playerID
                }
            },
            {
                $group: {
                    _id: null,
                    rosters: {
                        $push: "$rosters"
                    },
                    count: {
                        $sum: 1.0
                    }
                }
            },
            {
                $unwind: "$rosters"
            },
            {
                $unwind: "$rosters"
            },
            {
                $match: {
                    "rosters.participants.player.playerID": playerID,
                    "rosters.won": true
                }
            },
            {
                $group: {
                    _id: null,
                    totalCount: {
                        $addToSet: "$count"
                    },
                    won: {
                        $sum: 1.0
                    }
                }
            },
            {
                $unwind: "$totalCount"
            }
        ]).exec(),
        Match_1.Match.aggregate([
            {
                $match: {
                    patchVersion: {
                        $gte: publicRuntimeConfig.currentSeasonPatch
                    },
                    "rosters.participants.player.playerID": playerID
                }
            },
            {
                $project: {
                    rosters: 1.0
                }
            },
            {
                $unwind: "$rosters"
            },
            {
                $unwind: "$rosters.participants"
            },
            {
                $match: {
                    "rosters.participants.player.playerID": playerID
                }
            },
            {
                $group: {
                    _id: null,
                    rosters: {
                        $push: "$rosters"
                    },
                    totalCount: {
                        $sum: 1.0
                    }
                }
            },
            {
                $unwind: "$rosters"
            },
            {
                $group: {
                    _id: "$rosters.participants.actor",
                    totalCount: {
                        $addToSet: "$totalCount"
                    },
                    won: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$rosters.won", true]
                                },
                                1.0,
                                0.0
                            ]
                        }
                    },
                    kills: {
                        $sum: "$rosters.participants.kills"
                    },
                    assists: {
                        $sum: "$rosters.participants.assists"
                    },
                    deaths: {
                        $sum: "$rosters.participants.deaths"
                    },
                    count: {
                        $sum: 1.0
                    }
                }
            },
            {
                $match: {
                    won: {
                        $gte: 5.0
                    }
                }
            },
            {
                $unwind: "$totalCount"
            },
            {
                $sort: {
                    count: -1.0
                }
            },
            {
                $limit: 5.0
            }
        ]).exec(),
        Match_1.Match.aggregate([
            {
                $match: {
                    patchVersion: {
                        $gte: publicRuntimeConfig.currentSeasonPatch
                    },
                    "rosters.participants.player.playerID": playerID
                }
            },
            {
                $project: {
                    rosters: 1.0
                }
            },
            {
                $unwind: "$rosters"
            },
            {
                $match: {
                    "rosters.participants.player.playerID": {
                        $ne: playerID
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    rosters: {
                        $push: "$rosters"
                    },
                    totalCount: {
                        $sum: 1.0
                    }
                }
            },
            {
                $unwind: "$rosters"
            },
            {
                $unwind: "$rosters.participants"
            },
            {
                $group: {
                    _id: "$rosters.participants.actor",
                    totalCount: {
                        $addToSet: "$totalCount"
                    },
                    lost: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$rosters.won", true]
                                },
                                1.0,
                                0.0
                            ]
                        }
                    },
                    count: {
                        $sum: 1.0
                    }
                }
            },
            {
                $match: {
                    lost: {
                        $gte: 5.0
                    }
                }
            },
            {
                $project: {
                    _id: 1.0,
                    totalCount: 1.0,
                    lost: 1.0,
                    count: 1.0,
                    loseRate: {
                        $multiply: [
                            {
                                $divide: ["$lost", "$count"]
                            },
                            100.0
                        ]
                    }
                }
            },
            {
                $unwind: "$totalCount"
            },
            {
                $sort: {
                    loseRate: -1.0
                }
            },
            {
                $limit: 5.0
            }
        ]).exec(),
        Match_1.Match.aggregate([
            {
                $match: {
                    patchVersion: {
                        $gte: publicRuntimeConfig.currentSeasonPatch
                    },
                    "rosters.participants.player.playerID": playerID
                }
            },
            {
                $project: {
                    rosters: 1.0
                }
            },
            {
                $unwind: "$rosters"
            },
            {
                $match: {
                    "rosters.participants.player.playerID": playerID
                }
            },
            {
                $group: {
                    _id: null,
                    rosters: {
                        $push: "$rosters"
                    },
                    totalCount: {
                        $sum: 1.0
                    }
                }
            },
            {
                $unwind: "$rosters"
            },
            {
                $unwind: "$rosters.participants"
            },
            {
                $match: {
                    "rosters.participants.player.playerID": {
                        $ne: playerID
                    }
                }
            },
            {
                $group: {
                    _id: "$rosters.participants.player.playerID",
                    names: {
                        $addToSet: "$rosters.participants.player.name"
                    },
                    won: {
                        $sum: {
                            $cond: ["$rosters.won", 1.0, 0.0]
                        }
                    },
                    count: {
                        $sum: 1.0
                    },
                    totalCount: {
                        $addToSet: "$totalCount"
                    }
                }
            },
            {
                $match: {
                    won: {
                        $gte: 3.0
                    }
                }
            },
            {
                $project: {
                    _id: 1.0,
                    name: { $arrayElemAt: ["$names", 0] },
                    won: 1.0,
                    count: 1.0,
                    totalCount: 1.0,
                    winRate: {
                        $multiply: [
                            {
                                $divide: ["$won", "$count"]
                            },
                            100.0
                        ]
                    }
                }
            },
            {
                $unwind: "$totalCount"
            },
            {
                $sort: {
                    count: -1.0
                }
            },
            {
                $limit: 5.0
            }
        ]).exec(),
        Match_1.Match.aggregate([
            {
                $match: {
                    patchVersion: {
                        $gte: publicRuntimeConfig.currentSeasonPatch
                    },
                    "rosters.participants.player.playerID": playerID
                }
            },
            {
                $project: {
                    rosters: 1.0
                }
            },
            {
                $unwind: "$rosters"
            },
            {
                $match: {
                    "rosters.participants.player.playerID": {
                        $ne: playerID
                    }
                }
            },
            {
                $unwind: "$rosters.participants"
            },
            {
                $group: {
                    _id: "$rosters.participants.player.playerID",
                    names: {
                        $addToSet: "$rosters.participants.player.name"
                    },
                    lost: {
                        $sum: {
                            $cond: ["$rosters.won", 1.0, 0.0]
                        }
                    },
                    count: {
                        $sum: 1.0
                    }
                }
            },
            {
                $match: {
                    lost: {
                        $gte: 3.0
                    }
                }
            },
            {
                $project: {
                    _id: 1.0,
                    name: { $arrayElemAt: ["$names", 0] },
                    lost: 1.0,
                    count: 1.0,
                    loseRate: {
                        $multiply: [
                            {
                                $divide: ["$lost", "$count"]
                            },
                            100.0
                        ]
                    }
                }
            },
            {
                $sort: {
                    lost: -1.0
                }
            },
            {
                $limit: 5.0
            }
        ]).exec()
    ])
        .then(aggregatedData => {
        if (aggregatedData[0][0]) {
            return {
                winrate: {
                    won: aggregatedData[0][0].won,
                    of_matches: aggregatedData[0][0].totalCount
                },
                favorites: aggregatedData[1],
                nightmares: aggregatedData[2],
                friends: aggregatedData[3],
                nemeses: aggregatedData[4]
            };
        }
        else {
            throw new Error("No winrate aggregated");
        }
    })
        .catch(err => {
        console.error(err);
        return undefined;
    });
}
exports.aggregateData = aggregateData;
function formatMatch(match, included) {
    const telemetryAssetId = match.relationships.assets.data[0]
        ? match.relationships.assets.data[0].id
        : undefined;
    const findTelemetry = telemetryAssetId
        ? included.find((e) => e.id === telemetryAssetId)
        : undefined;
    const telemetryURL = findTelemetry
        ? findTelemetry.attributes.URL
        : undefined;
    if (!telemetryURL) {
        return undefined;
    }
    const customMatchDataModel = {
        matchID: match.id,
        createdAt: new Date(match.attributes.createdAt),
        duration: match.attributes.duration,
        gameMode: match.attributes.gameMode,
        patchVersion: match.attributes.patchVersion,
        shardId: match.attributes.shardId,
        endGameReason: match.attributes.stats.endGameReason,
        spectators: new Array(),
        rosters: new Array(),
        telemetryURL
    };
    for (let spectatorIndex = 0; spectatorIndex < match.relationships.spectators.data.length; spectatorIndex++) {
        const spectatorParticipant = included.find((e) => e.id === match.relationships.spectators.data[spectatorIndex].id);
        const spectatorPlayer = included.find((e) => e.id === spectatorParticipant.relationships.player.data.id);
        customMatchDataModel.spectators.push({
            playerID: spectatorPlayer.id,
            name: spectatorPlayer.attributes.name
        });
    }
    for (let rosterIndex = 0; rosterIndex < match.relationships.rosters.data.length; rosterIndex++) {
        const roster = included.find((e) => e.id === match.relationships.rosters.data[rosterIndex].id);
        const customRosterDataModel = {
            acesEarned: roster.attributes.stats.acesEarned,
            gold: roster.attributes.stats.gold,
            heroKills: roster.attributes.stats.heroKills,
            krakenCaptures: roster.attributes.stats.krakenCaptures,
            side: roster.attributes.stats.side,
            turretKills: roster.attributes.stats.turretKills,
            turretsRemaining: roster.attributes.stats.turretsRemaining,
            won: JSON.parse(roster.attributes.won),
            participants: new Array()
        };
        for (let participantIndex = 0; participantIndex < roster.relationships.participants.data.length; participantIndex++) {
            const participant = included.find((e) => e.id ===
                roster.relationships.participants.data[participantIndex].id);
            const player = included.find((e) => e.id === participant.relationships.player.data.id);
            const customParticipantDataModel = {
                actor: participant.attributes.actor.slice(1, -1),
                kills: participant.attributes.stats.kills,
                assists: participant.attributes.stats.assists,
                deaths: participant.attributes.stats.deaths,
                firstAfkTime: participant.attributes.stats.firstAfkTime,
                gold: participant.attributes.stats.gold,
                items: participant.attributes.stats.items,
                jungleKills: participant.attributes.stats.jungleKills,
                nonJungleMinionKills: participant.attributes.stats.nonJungleMinionKills,
                farm: participant.attributes.stats.farm,
                krakenCaptures: participant.attributes.stats.krakenCaptures,
                skinKey: participant.attributes.stats.skinKey,
                wentAfk: participant.attributes.stats.wentAfk,
                player: {
                    playerID: player.id,
                    name: player.attributes.name
                    // played_aral: player.attributes.stats.gamesPlayed.aral,
                    // played_blitz: player.attributes.stats.gamesPlayed.blitz,
                    // played_casual: player.attributes.stats.gamesPlayed.casual,
                    // played_ranked: player.attributes.stats.gamesPlayed.ranked,
                    // played_casual_5v5:
                    //   player.attributes.stats.gamesPlayed.casual_5v5,
                    // guildTag: player.attributes.stats.guildTag,
                    // karmaLevel: player.attributes.stats.karmaLevel,
                    // rank_3v3: player.attributes.stats.rankPoints.ranked,
                    // rank_blitz: player.attributes.stats.rankPoints.blitz,
                    // skillTier: player.attributes.stats.skillTier,
                    // wins: player.attributes.stats.wins
                }
            };
            customRosterDataModel.participants.push(customParticipantDataModel);
        }
        customMatchDataModel.rosters.push(customRosterDataModel);
    }
    return new Match_1.Match(customMatchDataModel);
}
exports.formatMatch = formatMatch;
function updatePlayerDB(playerDataFromDB, playerDataFromAPI) {
    if (playerDataFromDB) {
        if (playerDataFromAPI) {
            Object.assign(playerDataFromDB, playerDataFromAPI);
        }
        playerDataFromDB.save();
    }
    else if (playerDataFromAPI) {
        new Player_1.Player(playerDataFromAPI).save().then(savedPlayer => {
            console.log(`Successfuly saved new player ${savedPlayer.name}`);
        });
    }
}
exports.updatePlayerDB = updatePlayerDB;
function axiosAPI(options) {
    return axios_1.default({
        method: "get",
        url: `https://api.dc01.gamelockerapp.com/shards/${options.shardId}/${options.endPoint}`,
        params: options.params,
        headers: {
            "Content-Encoding": "gzip",
            "Content-Type": "application/json",
            "User-Agent": "js/vainglory",
            Authorization: options.key || serverRuntimeConfig.apiKey,
            "X-TITLE-ID": "semc-vainglory",
            Accept: "application/vnd.api+json"
        },
        responseType: "json"
    })
        .then(response => response.data)
        .catch(error => {
        if (error.response) {
            if (error.response.status == 404) {
                console.error("axiosAPI: 404 Not Found", options.shardId);
            }
            else if (error.response.status == 429) {
                console.error("axiosAPI: 429 Request Limit Reached", error.response.data);
            }
            else {
                console.error("axiosAPI: " + error.response.status + " Error", error.response.data);
            }
            throw new Error(error.response.status);
        }
        else if (error.request) {
            console.error("axiosAPI: No response from the API.", error.request);
            throw new Error("No response from the API.");
        }
        else {
            console.error("Error in setting up the request.", error.message);
            throw error;
        }
    });
}
exports.axiosAPI = axiosAPI;
//# sourceMappingURL=getData.js.map