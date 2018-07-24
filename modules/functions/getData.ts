// need to redo the entire logic - serve retrieved data directly, save to db asynchronously

import axios, { AxiosResponse } from "axios";

import { Player, IPlayer } from "./../../models/Player";
import { Match, IMatch } from "./../../models/Match";
import { apiKey } from "./constants";

export default (IGN: string): Promise<PlayerWithMatches> => {
  return new Promise((resolve, reject): void => {
    getPlayer(IGN)
      .then((playerData: IPlayer) => formatDataPopulateMatches(playerData))
      .then(playerAndMatchesData => aggregateData(playerAndMatchesData))
      .then(aggregatedData => resolve(aggregatedData))
      .catch(error => {
        reject({ errorID: "10", error: error });
      });
  });
};

const getPlayer = (IGN: string): Promise<IPlayer> => {
  return new Promise((resolve, reject) => {
    Player.findOne({ name: IGN })
      .exec()
      .then(playerData => {
        if (playerData) {
          if (
            new Date().getTime() - new Date(playerData.retrieval).getTime() >
            300000
          ) {
            if (playerData.exists) {
              return getPlayerAPI(
                playerData.name!, // queried by name
                playerData.shardId
              )
                .then((APIData: any) => {
                  return compareIDs(APIData, playerData);
                })
                .then((data: IPlayer) => {
                  resolve(data);
                })
                .catch((err: any) => {
                  reject("id: 1 " + err);
                });
            } else {
              return getPlayerAPI(playerData.name!) // queried by name
                .then(APIData => {
                  return compareIDs(APIData, playerData);
                })
                .then(data => {
                  resolve(data);
                })
                .catch(err => {
                  reject("id: 2 " + err);
                });
            }
          } else {
            if (playerData.exists) {
              resolve(playerData);
            } else {
              reject("id: 3 Player does not exist.");
            }
          }
        } else {
          return getPlayerAPI(IGN)
            .then(APIData => {
              return Player.findOne({ playerID: APIData.playerID })
                .exec()
                .then(foundPlayerByID => {
                  if (foundPlayerByID) {
                    return getMatches("updateIGN", APIData);
                  }
                  return getMatches("new", APIData);
                });
            })
            .then((data: any) => {
              resolve(data);
            })
            .catch((err: any) => {
              reject("id: 4 " + err);
            });
        }
      })
      .catch(err => reject("id: 14 " + err));
  });
};

export type PlayerWithMatches = {
  player?: IPlayer;
  matches?: IMatch[];
  error: boolean;
  extension?: boolean;
};

const formatDataPopulateMatches = (
  playerData: IPlayer
): Promise<PlayerWithMatches> => {
  // City.find({})
  //   .populate({
  //     path: "Articles",
  //     options: {
  //       limit: 2,
  //       sort: { created: -1 },
  //       skip: req.params.pageIndex * 2
  //     }
  //   })
  //   .exec(function(err, cities) {
  //     if (err) return handleError(res, err);
  //     return res.status(200).json(cities);
  //   });

  return new Promise((resolve, reject) => {
    Match.find(
      { matchID: { $in: [...playerData.matchRefs.slice(0, 12)] } },
      null,
      {
        sort: { createdAt: -1 }
      }
    )
      .exec()
      .then(matches => {
        delete playerData.matchRefs;
        resolve({
          player: playerData,
          matches: matches,
          error: false,
          extension: false
        });
      })
      .catch(err => reject("id: 11 " + err));
  });

  // return new Promise((resolve, reject) => {
  //   db
  //     .getAll(...playerData.matchRefs.slice(0, 14))
  //     .then(docs => {
  //       delete playerData.matchRefs;
  //       resolve({
  //         player: playerData,
  //         matches: docs.map(doc => doc.data()),
  //         error: false,
  //         extension: false
  //       });
  //     })
  //     .catch(err => reject("id: 11 " + err));
  // });
};

const aggregateData = data => {
  const season = "3.4"; // summer season start ?

  return Promise.all([
    Match.aggregate([
      {
        $match: {
          patchVersion: {
            $gte: season
          },
          "rosters.participants.player.name": data.player.name
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
          "rosters.participants.player.name": data.player.name,
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
    Match.aggregate([
      {
        $match: {
          patchVersion: {
            $gte: season
          },
          "rosters.participants.player.name": data.player.name
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
          "rosters.participants.player.name": data.player.name
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
    Match.aggregate([
      {
        $match: {
          patchVersion: {
            $gte: season
          },
          "rosters.participants.player.name": data.player.name
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
          "rosters.participants.player.name": {
            $ne: data.player.name
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
    Match.aggregate([
      {
        $match: {
          patchVersion: {
            $gte: season
          },
          "rosters.participants.player.name": data.player.name
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
          "rosters.participants.player.name": data.player.name
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
          "rosters.participants.player.name": {
            $ne: data.player.name
          }
        }
      },
      {
        $group: {
          _id: "$rosters.participants.player.name",
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
    Match.aggregate([
      {
        $match: {
          patchVersion: {
            $gte: season
          },
          "rosters.participants.player.name": data.player.name
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
          "rosters.participants.player.name": {
            $ne: data.player.name
          }
        }
      },
      {
        $unwind: "$rosters.participants"
      },
      {
        $group: {
          _id: "$rosters.participants.player.name",
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
            $gte: 2.0
          }
        }
      },
      {
        $project: {
          _id: 1.0,
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
      try {
        return {
          ...data,
          aggregatedData: {
            winrate: {
              won: aggregatedData[0][0].won,
              of_matches: aggregatedData[0][0].totalCount
            },
            favorites: aggregatedData[1],
            nightmares: aggregatedData[2],
            friends: aggregatedData[3],
            nemeses: aggregatedData[4]
          }
        };
      } catch (err) {
        throw new Error(err);
      }
    })
    .catch(err => {
      console.error(err);
      return data;
    });
};

const getPlayerAPI = (IGN: string, dbRegion?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const regions = ["na", "eu", "sg", "sa", "ea", "cn"];
    //const regions = ["eu"];
    let regionIndex = 0;

    const tryRegion = (region: string) => {
      axiosAPI({
        shardId: region,
        endPoint: "players",
        params: { "filter[playerNames]": IGN }
      })
        .then(player => {
          const data = player.data[0];
          let customPlayerDataModel;

          try {
            customPlayerDataModel = {
              exists: true,
              retrieval: new Date(),
              playerID: data.id,
              name: data.attributes.name,
              shardId: data.attributes.shardId,
              createdAt: new Date(data.attributes.createdAt),
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
              rank_blitz: data.attributes.stats.rankPoints.blitz,
              skillTier: data.attributes.stats.skillTier,
              wins: data.attributes.stats.wins,
              matchRefs: []
            };
          } catch (err) {
            console.error(err);
            throw new Error("veryold");
          }

          resolve(customPlayerDataModel);
        })
        .catch(err => {
          if (err.message === "veryold") {
            reject("veryold");
          }
          if (regionIndex + 1 == regions.length) {
            if (err.message == "404") {
              saveNonExist(IGN);
              reject("404 Player was not found on any server.");
            }
            reject(err + " error while retrieving player.");
          } else {
            console.log("Not Found.", IGN, regions[regionIndex]);
            regionIndex++;
            tryRegion(regions[regionIndex]);
          }
        });
    };

    if (dbRegion) {
      regionIndex = -1;
      tryRegion(dbRegion);
    } else {
      tryRegion(regions[regionIndex]);
    }
  });
};

const compareIDs = (APIData: any, DBData: IPlayer): Promise<IPlayer> => {
  if (APIData.playerID === DBData.playerID) {
    return getMatches("update", APIData);
  } else {
    return Player.updateOne({ name: DBData.name }, { $unset: { name: "" } })
      .exec()
      .then(res => console.log(res))
      .then(() => {
        return Player.findOne({ playerID: APIData.playerID }).exec();
      })
      .then(playerData => {
        if (playerData) {
          return getMatches("update", APIData);
        }
        return getMatches("new", APIData);
      })
      .catch(err => {
        throw new Error(err);
      });
  }
};

// Match

const getMatches = (command: string, playerData: IPlayer): Promise<IPlayer> => {
  return axiosAPI({
    shardId: playerData.shardId,
    endPoint: "matches",
    params: {
      "page[offset]": 0,
      "page[limit]": 50,
      sort: "-createdAt",
      "filter[playerNames]": playerData.name
    }
  })
    .then(matches => {
      if (matches) {
        if (matches.data.length == 0) {
          return updatePlayerDB(command, playerData, []);
          // throw new Error("No matches found.");
        }
        return uploadMatches(matches).then(matchRefs => {
          return updatePlayerDB(command, playerData, matchRefs);
        });
      } else {
        throw new Error(
          "Error retrieving matches: " + JSON.stringify(matches.errors)
        );
      }
    })
    .catch(err => {
      if (err.message == "404") {
        return updatePlayerDB(command, playerData, []);
      }
      // return updatePlayerDB(command, playerData, []);
      throw new Error("id: 8 " + err);
    });
};

export const axiosAPI = (options: {
  shardId: string;
  endPoint: string;
  params: any;
  key?: string;
}) => {
  return axios({
    method: "get",
    url:
      "https://api.dc01.gamelockerapp.com/shards/" +
      options.shardId +
      "/" +
      options.endPoint,
    params: options.params,
    headers: {
      "Content-Encoding": "gzip",
      "Content-Type": "application/json",
      "User-Agent": "js/vainglory",
      Authorization: apiKey,
      "X-TITLE-ID": "semc-vainglory",
      Accept: "application/vnd.api+json"
    },
    responseType: "json"
  })
    .then((response: AxiosResponse<any>) => {
      return response.data;
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status == 404) {
          console.log("axiosAPI: 404 Not Found", options.shardId);
        } else if (error.response.status == 429) {
          console.log(
            "axiosAPI: 429 Request Limit Reached",
            error.response.data
          );
        } else {
          console.error(
            "axiosAPI: " + error.response.status + " Error",
            error.response.data
          );
        }

        throw new Error(error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(
          "Error occured while fetching API. CMD+F this line to inspect the error.",
          error.request
        );
        throw new Error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error(
          "Error occured while fetching API. CMD+F this line to inspect the error.",
          error.message
        );
        throw new Error(error.message);
      }
      // console.error(
      //     "Error occured while fetching API. CMD+F this line to inspect the error.",
      //     error.config
      // );
      // throw new Error(error.config);
    });
};

const uploadMatches = (matches: any) => {
  const retrievedMatchesIds: string[] = matches.data.map(
    (match: any) => match.id
  );

  const newMatches: IMatch[] = [];

  return Match.find({ matchID: { $in: retrievedMatchesIds } })
    .exec()
    .then(existingMatches => {
      const existingMatchesIds: string[] = existingMatches.map(e => e.matchID);

      matches.data.forEach((match: any) => {
        if (existingMatchesIds.indexOf(match.id) == -1) {
          // axiosAPI({
          //     shardId: match.attributes.shardId,
          //     endPoint: "matches/" + match.id,
          //     params: {}
          // })
          //     .then(match => {
          //         if (match) {
          //             console.log("Retrieved single match.")
          //         } else {
          //             throw new Error(
          //                 "Error retrieving match: " +
          //                     JSON.stringify(match.errors)
          //             );
          //         }
          //     })
          //     .catch(err => {
          //         throw new Error("id: 8 " + err);
          //     });
          const telemetryAssetId = match.relationships.assets.data[0]
            ? match.relationships.assets.data[0].id
            : undefined;
          const findTelemetry = matches.included.find(
            (e: any) => e.id === telemetryAssetId
          );
          const telemetryURL = findTelemetry.attributes
            ? findTelemetry.attributes.URL
            : undefined;
          var customMatchDataModel = {
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

          for (
            var spectatorIndex = 0;
            spectatorIndex < match.relationships.spectators.data.length;
            spectatorIndex++
          ) {
            const spectatorParticipant = matches.included.find(
              (e: any) =>
                e.id === match.relationships.spectators.data[spectatorIndex].id
            );
            const spectatorPlayer = matches.included.find(
              (e: any) =>
                e.id === spectatorParticipant.relationships.player.data.id
            );

            customMatchDataModel.spectators.push({
              id: spectatorPlayer.id,
              name: spectatorPlayer.attributes.name
            });
          }

          for (
            var rosterIndex = 0;
            rosterIndex < match.relationships.rosters.data.length;
            rosterIndex++
          ) {
            const roster = matches.included.find(
              (e: any) =>
                e.id === match.relationships.rosters.data[rosterIndex].id
            );

            var customRosterDataModel = {
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

            for (
              var participantIndex = 0;
              participantIndex < roster.relationships.participants.data.length;
              participantIndex++
            ) {
              const participant = matches.included.find(
                (e: any) =>
                  e.id ===
                  roster.relationships.participants.data[participantIndex].id
              );

              const player = matches.included.find(
                (e: any) => e.id === participant.relationships.player.data.id
              );

              var customParticipantDataModel = {
                actor: participant.attributes.actor.substring(
                  1,
                  participant.attributes.actor.length - 1
                ),
                skillTier: participant.attributes.stats.skillTier,
                assists: participant.attributes.stats.assists,
                crystalMineCaptures:
                  participant.attributes.stats.crystalMineCaptures,
                deaths: participant.attributes.stats.deaths,
                farm: participant.attributes.stats.farm,
                firstAfkTime: participant.attributes.stats.firstAfkTime,
                gold: participant.attributes.stats.gold,
                goldMineCaptures: participant.attributes.stats.goldMineCaptures,
                items: participant.attributes.stats.items,
                jungleKills: participant.attributes.stats.jungleKills,
                kills: participant.attributes.stats.kills,
                krakenCaptures: participant.attributes.stats.krakenCaptures,
                nonJungleMinionKills:
                  participant.attributes.stats.nonJungleMinionKills,
                skinKey: participant.attributes.stats.skinKey,
                wentAfk: participant.attributes.stats.wentAfk,
                player: {
                  id: player.id,
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

              customRosterDataModel.participants.push(
                customParticipantDataModel
              );
            }

            customMatchDataModel.rosters.push(customRosterDataModel);
          }

          if (telemetryAssetId !== undefined) {
            newMatches.push(new Match(customMatchDataModel));
          }
        }
      });

      return newMatches;
    })
    .then(newMatches => {
      return Match.insertMany(newMatches, { ordered: false })
        .then(m => {
          console.log("Inserted " + m.length + " matches.");
          return Promise.resolve(retrievedMatchesIds);
        })
        .catch(err => {
          console.error("Error inserting matches.", err);
          throw new Error("Error inserting matches.");
        });
    })
    .catch(err => {
      console.log(err);
      throw new Error("id: 15 " + err);
    });
};

const updatePlayerDB = (
  command: string,
  customPlayerDataModel: any,
  matchRefs: string[]
): Promise<IPlayer> => {
  return new Promise((resolve, reject) => {
    console.log("command", command);
    if (command === "new") {
      if (matchRefs) {
        customPlayerDataModel.matchRefs = matchRefs.slice();
      } else {
        customPlayerDataModel.matchRefs = new Array();
      }

      const newPlayer = new Player(customPlayerDataModel);

      newPlayer
        .save()
        .then(newPlayerData => {
          console.log("Successfuly saved new player");
          resolve(newPlayerData);
        })
        .catch(err => {
          console.error("Failed to upload", err);
          reject(err);
        });
    } else {
      Player.findOne({ playerID: customPlayerDataModel.playerID })
        .exec()
        .then(playerData => {
          if (!playerData) {
            console.log(playerData);
            throw new Error("System error. #tswai");
          }

          if (command === "updateIGN") {
            if (playerData.IGNHistory) {
              customPlayerDataModel.IGNHistory = [
                playerData.name,
                ...playerData.IGNHistory.slice()
              ];
            } else {
              customPlayerDataModel.IGNHistory = [playerData.name];
            }
          } else {
            // add this field to older entries
            if (!customPlayerDataModel.IGNHistory) {
              customPlayerDataModel.IGNHistory = new Array();
            }
          }

          const deduplicatedMatchRefs = [
            ...new Set([...matchRefs.slice(), ...playerData.matchRefs.slice()])
          ];
          customPlayerDataModel.matchRefs = deduplicatedMatchRefs;

          Object.assign(playerData, customPlayerDataModel);
          // not working: const newPlayerData: IPlayer = { ...playerData, ...customPlayerDataModel };
          playerData
            .save()
            .then(() => resolve(playerData))
            .catch(err => reject(err));
        });
    }
  });
};

const saveNonExist = (IGN: string) => {
  var nonExistData = {
    name: IGN,
    retrieval: new Date(),
    exists: false
  };

  Player.findOneAndUpdate({ name: IGN }, nonExistData, {
    upsert: true
  })
    .then(() => {
      console.log("Saved " + IGN + " as nonexist.");
    })
    .catch(err => console.error("Could not save/update nonexist " + err));

  // var colRef = db.collection("players");
  // var query = colRef
  //   .where("name", "==", IGN)
  //   .limit(1)
  //   .get()
  //   .then(snapshot => {
  //     return snapshot.docs.map(doc => {
  //       return doc.data();
  //     });
  //   })
  //   .then(queryResult => {
  //     if (queryResult.length === 1) {
  //       var doc = queryResult[0];
  //       colRef.doc(doc.id).update(nonExistData);
  //     } else {
  //       db.collection("players").add(nonExistData);
  //     }
  //   })
  //   .catch(err => Promise.reject("id: 13 " + err));
};
