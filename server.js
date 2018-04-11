const express = require("express");
const next = require("next");
const helmet = require("helmet");

const path = require("path");
const PORT = process.env.PORT || 3000;

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const seripap = require("vainglory");
const vainglory = new seripap(
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3ZmVlYTMwMC1mMTU3LTAxMzQtYzgzZS0wMjQyYWMxMTAwMDMiLCJpc3MiOiJnYW1lbG9ja2VyIiwib3JnIjoiZnN0dHItaWNsb3VkLWNvbSIsImFwcCI6IjdmZWJlM2UwLWYxNTctMDEzNC1jODNkLTAyNDJhYzExMDAwMyIsInB1YiI6InNlbWMiLCJ0aXRsZSI6InZhaW5nbG9yeSIsInNjb3BlIjoiY29tbXVuaXR5IiwibGltaXQiOjEwfQ.KA8RH66EdM6lC6qqBZiJTbLDwHk-bsrOweA14A-L6OU"
);

const axios = require("axios");

const admin = require("firebase-admin");

var serviceAccount = require("./VAINZONE-851534c01db3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(helmet());

    server.use((req, res, callback) => {
      var allowedOrigins = [
        "http://localhost:3000",
        "https://localhost:3000",
        "http://x.vainglory.eu",
        "https://x.vainglory.eu",
        "http://test.vainglory.eu",
        "https://test.vainglory.eu",
        "http://vain.zone",
        "https://vain.zone",
        "http://www.vain.zone",
        "https://www.vain.zone"
      ];
      var origin = req.headers.origin;
      if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
      //res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header("Access-Control-Allow-Headers", "Content-Type");
      //res.header('Access-Control-Allow-Credentials', true);

      return callback();
    });

    server.get("/", (req, res) => {
      app.render(req, res, "/extension/player", {});
    });

    server.get("/extension/", (req, res) => {
      app.render(req, res, "/extension/player", {
        error: false,
        extension: true
      });
    });

    server.get("/extension/player/:IGN", (req, res) => {
      app.render(req, res, "/extension/player", {
        IGN: req.params.IGN,
        error: false,
        extension: false
      });
    });

    server.get("/api/matches/:IGN", (req, res) => {
      getData(req.params.IGN)
        .then(data => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(JSON.stringify(data));
          res.end();
        })
        .catch(error => {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.write(JSON.stringify({ error: true, errorMessage: error }));
          res.end();
        });
    });

    server.get("/api/telemetry", (req, res) => {
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
          console.log(damagesData);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(JSON.stringify({ damagesData: damagesData }));
          res.end();
        })
        .catch(function(error) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.write(JSON.stringify({ error: "Error retrieving telemetry" }));
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

    // server.get("/p/:id", (req, res) => {
    //   const actualPage = "/post";
    //   const queryParams = { id: req.params.id };
    //   app.render(req, res, actualPage, queryParams);
    // });

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, err => {
      if (err) throw err;
      console.log("> Ready on http://localhost:" + PORT);
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });

const calculateDamagesFromTelemetry = (telemetry, match) => {
  const data = {};
  data.rosters = match.rosters;
  data.telemetry = telemetry;

  const rosters = [{}, {}];
  var highest = 0;

  for (var rosterIndex = 0; rosterIndex < data.rosters.length; rosterIndex++) {
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
                data.rosters[rosterIndex].participants[participantIndex].actor +
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

const getData = IGN => {
  return new Promise((resolve, reject) => {
    getPlayer(IGN)
      .then(playerData => formatDataPopulateMatches(playerData))
      .then(playerAndMatchesData => resolve(playerAndMatchesData))
      .catch(error => {
        reject("id: 10 " + error);
      });
  });
};

const formatDataPopulateMatches = playerData => {
  return new Promise((resolve, reject) => {
    db
      .getAll(...playerData.matchRefs.slice(0, 24))
      .then(docs => {
        delete playerData.matchRefs;
        resolve({
          player: playerData,
          matches: docs.map(doc => doc.data()),
          error: false,
          extension: false
        });
      })
      .catch(err => reject("id: 11 " + err));
  });
};

// START PLAYER

const getPlayer = IGN => {
  return new Promise((resolve, reject) => {
    var query = db
      .collection("players")
      .where("name", "==", IGN)
      .limit(1)
      .get()
      .then(snapshot => {
        return snapshot.docs.map(doc => {
          return doc.data();
        });
      })
      .then(queryResult => {
        if (queryResult.length === 1) {
          var playerData = queryResult[0];
          if (new Date() - playerData.retrieval > 300) {
            if (playerData.exists) {
              return getPlayerAPI(playerData.name, playerData.shardId)
                .then(APIData => {
                  return compareIDs(APIData, playerData);
                })
                .then(data => {
                  resolve(data);
                })
                .catch(err => {
                  reject("id: 1 " + err);
                });
            } else {
              return getPlayerAPI(playerData.name)
                .then(APIData => {
                  return compareIDs(APIData, playerData).then(data => {});
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
              return getMatches("new", APIData);
            })
            .then(data => {
              resolve(data);
            })
            .catch(err => {
              reject("id: 4 " + err);
            });
        }
      });
  });
};

const getPlayerAPI = (IGN, dbRegion) => {
  return new Promise((resolve, reject) => {
    const regions = ["na", "eu", "sg", "sa", "ea", "cn"];
    var regionIndex = 0;

    const tryRegion = region => {
      axiosAPI({
        shardId: "eu",
        endPoint: "players",
        params: { "filter[playerNames]": IGN }
      })
        .then(player => {
          const data = player.data[0];

          var customPlayerDataModel = {
            exists: true,
            retrieval: new Date(),
            id: data.id,
            name: data.attributes.name,
            shardId: data.attributes.shardId,
            createdAt: new Date(data.attributes.createdAt),
            patchVersion: data.attributes.patchVersion,
            played_aral: data.attributes.stats.gamesPlayed.aral,
            played_blitz: data.attributes.stats.gamesPlayed.blitz,
            played_casual: data.attributes.stats.gamesPlayed.casual,
            played_ranked: data.attributes.stats.gamesPlayed.ranked,
            played_casual_5v5: data.attributes.stats.gamesPlayed.casual_5v5,
            guildTag: data.attributes.stats.guildTag,
            karmaLevel: data.attributes.stats.karmaLevel,
            level: data.attributes.stats.level,
            rank_3v3: data.attributes.stats.rankPoints.ranked,
            rank_blitz: data.attributes.stats.rankPoints.blitz,
            skillTier: data.attributes.stats.skillTier,
            wins: data.attributes.stats.wins,
            matchRefs: []
          };

          resolve(customPlayerDataModel);
        })
        .catch(err => {
          if (regionIndex + 1 == regions.length) {
            saveNonExist(IGN);
            reject(err);
          } else {
            regionIndex += 1;
            console.log("Not Found.", IGN, regions[regionIndex]);
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

const updatePlayerDB = (command, customPlayerDataModel, matchRefs) => {
  var documentReference = db
    .collection("players")
    .doc(customPlayerDataModel.id);

  return new Promise((resolve, reject) => {
    if (command == "new") {
      const transformedMatchRefs = matchRefs.map(ref =>
        db.collection("matches").doc(ref)
      );

      if (matchRefs) {
        customPlayerDataModel.matchRefs = transformedMatchRefs;
      } else {
        customPlayerDataModel.matchRefs = [];
      }

      return documentReference.set(customPlayerDataModel).then(() => {
        resolve(customPlayerDataModel);
      });
    } else {
      return db
        .runTransaction(t => {
          console.log("in update db");

          return t.get(documentReference).then(doc => {
            const filteredTransformedMatchRefs = [
              ...new Set([
                ...matchRefs,
                ...doc.data().matchRefs.map(ref => ref.id)
              ])
            ].map(ref => db.collection("matches").doc(ref));

            customPlayerDataModel.matchRefs = filteredTransformedMatchRefs;

            t.update(documentReference, customPlayerDataModel);

            return Promise.resolve(customPlayerDataModel);
          });
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject("Transaction failure: " + err);
        });
    }
  });
};

const compareIDs = (APIData, DBData) => {
  if (APIData.id === DBData.id) {
    return getMatches("update", APIData);
  } else {
    var documentReference = db.collection("players").doc(DBData.id);
    documentReference.update({ name: null });
    return db
      .collection("players")
      .where("id", "==", APIData.id)
      .limit(1)
      .get()
      .then(snapshot => {
        return snapshot.docs.map(doc => {
          return doc.data();
        });
      })
      .then(queryResult => {
        if (queryResult.length > 0) {
          return getMatches("update", APIData);
        } else {
          return getMatches("new", APIData);
        }
      })
      .catch(err => Promise.reject("id: 12 " + err));
  }
};

const saveNonExist = IGN => {
  var nonExistData = { name: IGN, retrieval: new Date(), exists: false };

  var colRef = db.collection("players");
  var query = colRef
    .where("name", "==", IGN)
    .limit(1)
    .get()
    .then(snapshot => {
      return snapshot.docs.map(doc => {
        return doc.data();
      });
    })
    .then(queryResult => {
      if (queryResult.length === 1) {
        var doc = queryResult[0];
        colRef.doc(doc.id).update(nonExistData);
      } else {
        db.collection("players").add(nonExistData);
      }
    })
    .catch(err => Promise.reject("id: 13 " + err));
};

// END PLAYER

const axiosAPI = options => {
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
      Authorization:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3ZmVlYTMwMC1mMTU3LTAxMzQtYzgzZS0wMjQyYWMxMTAwMDMiLCJpc3MiOiJnYW1lbG9ja2VyIiwib3JnIjoiZnN0dHItaWNsb3VkLWNvbSIsImFwcCI6IjdmZWJlM2UwLWYxNTctMDEzNC1jODNkLTAyNDJhYzExMDAwMyIsInB1YiI6InNlbWMiLCJ0aXRsZSI6InZhaW5nbG9yeSIsInNjb3BlIjoiY29tbXVuaXR5IiwibGltaXQiOjEwfQ.KA8RH66EdM6lC6qqBZiJTbLDwHk-bsrOweA14A-L6OU",
      "X-TITLE-ID": "semc-vainglory",
      Accept: "application/vnd.api+json"
    },
    responseType: "json"
  })
    .then(response => {
      console.log("here1", response.status);
      return Promise.resolve(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx

        if (error.response.status == 404) {
          return Promise.reject(
            `${JSON.stringify(error.response.data)} ${
              error.response.status
            } ${JSON.stringify(error.response.headers)}`
          );
        }

        return Promise.reject(
          `${JSON.stringify(error.response.data)} ${
            error.response.status
          } ${JSON.stringify(error.response.headers)}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        return Promise.reject(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        return Promise.reject("Error", error.message);
      }
      return Promise.reject(error.config);
    });
};

// START MATCH

const getMatches = (command, playerData) => {
  return axiosAPI({
    shardId: playerData.shardId,
    endPoint: "matches",
    params: {
      "page[offset]": 0,
      "page[limit]": 35,
      sort: "-createdAt",
      "filter[playerNames]": playerData.name
    }
  })
    .then(matches => {
      if (matches) {
        return uploadMatches(matches).then(matchRefs => {
          return updatePlayerDB(command, playerData, matchRefs);
        });
      } else if (matches.data.length == 0) {
        throw new Error("No matches found.");
      } else {
        throw new Error(
          "Error retrieven matches: " + JSON.stringify(matches.errors)
        );
      }
    })
    .catch(err => {
      throw new Error("id: 8 " + err);
    });
};

const uploadMatches = matches => {
  return Promise.all(
    matches.data.map(match => {
      var docRef = db.collection("matches").doc(match.id);

      return db.runTransaction(t => {
        return t
          .get(docRef)
          .then(doc => {
            if (doc.exists) {
              return Promise.resolve(match.id);
            } else {
              var customMatchDataModel = {
                id: match.id,
                createdAt: new Date(match.attributes.createdAt),
                duration: match.attributes.duration,
                gameMode: match.attributes.gameMode,
                patchVersion: match.attributes.patchVersion,
                shardId: match.attributes.shardId,
                endGameReason: match.attributes.stats.endGameReason,
                spectators: [],
                rosters: [],
                telemetryURL: matches.included.find(
                  e => e.id === match.relationships.assets.data[0].id
                ).attributes.URL
              };

              for (
                var spectatorIndex = 0;
                spectatorIndex < match.relationships.spectators.data.length;
                spectatorIndex++
              ) {
                const spectatorParticipant = matches.included.find(
                  e =>
                    e.id ===
                    match.relationships.spectators.data[spectatorIndex].id
                );
                const spectatorPlayer = matches.included.find(
                  e =>
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
                  e => e.id === match.relationships.rosters.data[rosterIndex].id
                );

                var customRosterDataModel = {
                  acesEarned: roster.attributes.stats.acesEarned,
                  gold: roster.attributes.stats.gold,
                  heroKills: roster.attributes.stats.heroKills,
                  krakenCaptures: roster.attributes.stats.krakenCaptures,
                  side: roster.attributes.stats.side,
                  turretKills: roster.attributes.stats.turretKills,
                  turretsRemaining: roster.attributes.stats.turretsRemaining,
                  won: roster.attributes.won,
                  participants: []
                };

                for (
                  var participantIndex = 0;
                  participantIndex <
                  roster.relationships.participants.data.length;
                  participantIndex++
                ) {
                  const participant = matches.included.find(
                    e =>
                      e.id ===
                      roster.relationships.participants.data[participantIndex]
                        .id
                  );

                  const player = matches.included.find(
                    e => e.id === participant.relationships.player.data.id
                  );

                  var customParticipantDataModel = {
                    actor: participant.attributes.actor.substring(
                      1,
                      participant.attributes.actor.length - 1
                    ),
                    assists: participant.attributes.stats.assists,
                    crystalMineCaptures:
                      participant.attributes.stats.crystalMineCaptures,
                    deaths: participant.attributes.stats.deaths,
                    farm: participant.attributes.stats.farm,
                    firstAfkTime: participant.attributes.stats.firstAfkTime,
                    gold: participant.attributes.stats.gold,
                    goldMineCaptures:
                      participant.attributes.stats.goldMineCaptures,
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

              t.set(docRef, customMatchDataModel);

              return Promise.resolve(match.id);
            }
          })
          .catch(err => {
            throw new Error("id: 9 " + err);
          });
      });
    })
  );
};
