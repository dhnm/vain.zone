import { Router, Response, Request } from "express";
const router: Router = Router();
import cacheMW from "./../functions/cacheMW";

import axios, { AxiosResponse } from "axios";
import { IMatch } from "models/Match";
import * as moment from "moment";

import { gameModeDict, apiKey } from "./../functions/constants";

export default router;

export type IOutput = {
  damagesData?: IDamages;
  towersDamagesData?: IDamages;
  banData?: IBans;
  singleMatchData?: ISingleMatchData;
  creatures5v5?: ICreatures5v5;
  draftOrder?: IDraftOrder;
  error: boolean;
};

router.get("/", cacheMW(300), (req: Request, res: Response): void => {
  const matchData = JSON.parse(req.query.match);
  axios({
    method: "get",
    url: matchData.telemetryURL,
    headers: {
      "Content-Encoding": "gzip",
      "Content-Type": "application/json",
      "User-Agent": "js/vainglory",
      "X-TITLE-ID": "semc-vainglory",
      Accept: "application/json"
    }
  })
    .then((response: AxiosResponse<any>): any => {
      console.log("obtaining telemetry with status", response.status);
      return response.data;
    })
    .then((telemetryData: any): void => {
      retrieveSingleMatch(matchData).then(singleMatchData => {
        const {
          damagesData,
          towersDamagesData,
          banData,
          creatures5v5,
          draftOrder,
          gameplayRoles
        } = loopThroughTelemetry(telemetryData, matchData);
        const output /*: IOutput */ = {
          damagesData,
          towersDamagesData,
          banData,
          singleMatchData,
          creatures5v5,
          draftOrder,
          gameplayRoles,
          error: false
        };

        res.writeHead(200, {
          "Content-Type": "application/json"
        });
        res.write(JSON.stringify(output));
        res.end();
      });
    })
    .catch(function(error) {
      const output: IOutput = {
        error: true
      };
      res.writeHead(404, {
        "Content-Type": "application/json"
      });
      res.write(JSON.stringify(output));
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

// const calculateDamagesFromTelemetry = (
//   telemetry: any,
//   match: any
// ): IDamages => {
//   const damagesData: IDamages = { rosters: [{}, {}], highest: 0 };

//   for (let rosterIndex = 0; rosterIndex < match.rosters.length; rosterIndex++) {
//     for (
//       let participantIndex = 0;
//       participantIndex < match.rosters[rosterIndex].participants.length;
//       participantIndex++
//     ) {
//       const totalDamage: number = telemetry
//         .filter(
//           (e: any) =>
//             e.type === "DealDamage" &&
//             e.payload.Actor ===
//               "*" +
//                 match.rosters[rosterIndex].participants[participantIndex]
//                   .actor +
//                 "*" &&
//             e.payload.Team == ["Left", "Right"][rosterIndex]
//         )
//         .map((e: any) => e.payload.Dealt)
//         .reduce((a: number, b: number) => a + b, 0);

//       if (totalDamage > damagesData.highest) {
//         damagesData.highest = totalDamage;
//       }

//       damagesData.rosters[rosterIndex][
//         match.rosters[rosterIndex].participants[participantIndex].actor
//       ] = totalDamage;
//     }
//   }

//   return damagesData;
// };

// const detectBans = (telemetry: any): IBans => {
//   const rostersBans: any[][] = [[], []];

//   telemetry.filter((e: any) => e.type == "HeroBan").forEach((e: any) => {
//     rostersBans[parseInt(e.payload.Team) - 1].push(
//       e.payload.Hero.substring(1, e.payload.Hero.length - 1)
//     );
//   });

//   const bansData: IBans = { rosters: rostersBans };

//   return bansData;
// };

// const getCreatures5v5 = (telemetry: any): ICreatures5v5 => {
//   const rosters: ICreatures5v5 = [
//     { blackclaw: 0, ghostwing: 0 },
//     { blackclaw: 0, ghostwing: 0 }
//   ];

//   telemetry
//     .filter(
//       (e: any) =>
//         e.type == "KillActor" &&
//         (e.payload.Killed === "*5v5_Ghostwing*" ||
//           e.payload.Killed === "*5v5_Blackclaw_Uncaptured*")
//     )
//     .forEach((e: any) => {
//       rosters[{ Left: 0, Right: 1 }[e.payload.Team]][
//         {
//           "*5v5_Ghostwing*": "ghostwing",
//           "*5v5_Blackclaw_Uncaptured*": "blackclaw"
//         }[e.payload.Killed]
//       ]++;
//     });

//   return rosters;
// };

export type ISingleMatchData = {
  [key: string]: { rankPoints: number; guildTag: string };
};

const retrieveSingleMatch = (matchData: IMatch) => {
  return axios({
    method: "get",
    url: `https://api.dc01.gamelockerapp.com/shards/${
      matchData.shardId
    }/matches/${matchData.matchID}`,
    headers: {
      "Content-Encoding": "gzip",
      "Content-Type": "application/json",
      "User-Agent": "js/vainglory",
      Authorization: apiKey,
      "X-TITLE-ID": "semc-vainglory",
      Accept: "application/vnd.api+json"
    }
  })
    .then((response: AxiosResponse<any>): any => {
      console.log("obtaining single match data with status", response.status);
      return response.data;
    })
    .then((match: any) => {
      const singleMatchData: ISingleMatchData = {};

      for (
        let rosterIndex = 0;
        rosterIndex < matchData.rosters.length;
        rosterIndex++
      ) {
        const currentRoster = matchData.rosters[rosterIndex];
        for (
          let participantIndex = 0;
          participantIndex < currentRoster.participants.length;
          participantIndex++
        ) {
          const currentParticipant =
            currentRoster.participants[participantIndex];

          const player = match.included.find(
            (e: any) => e.id === currentParticipant.player.id
          );

          if (!singleMatchData[currentParticipant.player.name]) {
            singleMatchData[currentParticipant.player.name] = {
              rankPoints: 0,
              guildTag: ""
            };
          }

          singleMatchData[currentParticipant.player.name].rankPoints =
            player.attributes.stats.rankPoints[
              gameModeDict[matchData.gameMode][2]
            ];

          singleMatchData[currentParticipant.player.name].guildTag =
            player.attributes.stats.guildTag;
        }
      }

      return singleMatchData;
    })
    .catch(error => {
      console.error(error);

      return undefined;
    });
};

export type IDamages = {
  rosters: { [key: string]: number }[];
  highest: number;
};

export type IBans = {
  rosters: string[][];
};

export type ICreatures5v5 = {
  blackclaw: number;
  ghostwing: number;
}[];

export type IDraftOrder = string[][];

const loopThroughTelemetry = (telemetryData, matchData) => {
  // const awards = {}

  const damagesData: IDamages = { rosters: [{}, {}], highest: 0 };
  const towersDamagesData: IDamages = { rosters: [{}, {}], highest: 0 };

  const banData: IBans = { rosters: [[], []] };

  const is5v5 =
    matchData.rosters[0].participants.length +
      matchData.rosters[1].participants.length ===
    10;
  const creatures5v5: ICreatures5v5 = [
    { blackclaw: 0, ghostwing: 0 },
    { blackclaw: 0, ghostwing: 0 }
  ];

  const creepKills = [{}, {}];

  const matchTimerStartTime = moment(
    telemetryData.find(e => e.type === "PlayerFirstSpawn").time
  );
  const first5v5TurretKillTime = is5v5
    ? moment(
        telemetryData.find(
          e => e.type === "KillActor" && e.payload.Killed === "*Turret5v5*"
        ).time
      )
    : undefined;

  const draftOrder = [[], []];

  for (let i = 0; i < telemetryData.length; i++) {
    const currVa = telemetryData[i];

    if (currVa.type === "DealDamage" && currVa.payload.TargetIsHero == 1) {
      // get damages
      const reference =
        damagesData.rosters[{ Left: 0, Right: 1 }[currVa.payload.Team]];
      const actorName = currVa.payload.Actor.replace(/\*/g, "");
      if (reference[actorName]) {
        reference[actorName] += currVa.payload.Dealt;
      } else {
        reference[actorName] = currVa.payload.Dealt;
      }
    } else if (
      currVa.type === "DealDamage" &&
      currVa.payload.TargetIsHero == 0
    ) {
      // get damages to turrets
      const reference =
        towersDamagesData.rosters[{ Left: 0, Right: 1 }[currVa.payload.Team]];
      const actorName = currVa.payload.Actor.replace(/\*/g, "");
      if (reference[actorName]) {
        reference[actorName] += currVa.payload.Dealt;
      } else {
        reference[actorName] = currVa.payload.Dealt;
      }
    } else if (currVa.type === "HeroBan") {
      // get bans
      banData.rosters[parseInt(currVa.payload.Team) - 1].push(
        currVa.payload.Hero.replace(/\*/g, "")
      );
    } else if (
      is5v5 &&
      currVa.type === "KillActor" &&
      (currVa.payload.Killed === "*5v5_Ghostwing*" ||
        currVa.payload.Killed === "*5v5_Blackclaw_Uncaptured*")
    ) {
      // get 5v5 creatures
      creatures5v5[{ Left: 0, Right: 1 }[currVa.payload.Team]][
        {
          "*5v5_Ghostwing*": "ghostwing",
          "*5v5_Blackclaw_Uncaptured*": "blackclaw"
        }[currVa.payload.Killed]
      ]++;
    } else if (currVa.type === "HeroSelect") {
      draftOrder[parseInt(currVa.payload.Team) - 1].push(
        currVa.payload.Hero.replace(/\*/g, "")
      );
    } else if (
      is5v5 &&
      moment(currVa.time).unix() - matchTimerStartTime.unix() <=
        Math.min(
          390,
          Math.max(
            270,
            first5v5TurretKillTime.unix() - matchTimerStartTime.unix()
          )
        ) &&
      currVa.type === "KillActor" &&
      !currVa.payload.TargetIsHero &&
      currVa.payload.Target !== "*VisionTotem*"
    ) {
      const reference = creepKills[{ Left: 0, Right: 1 }[currVa.payload.Team]];
      const actorName = currVa.payload.Actor.replace(/\*/g, "");

      if (reference[actorName]) {
        const minionType = detectMinionType(
          { Left: 0, Right: 1 }[currVa.payload.Team],
          currVa.payload.Position,
          currVa.payload.KilledTeam === "Neutral"
        );
        if (minionType) {
          reference[actorName][minionType] += 1;
        }
      } else {
        const minionType = detectMinionType(
          { Left: 0, Right: 1 }[currVa.payload.Team],
          currVa.payload.Position,
          currVa.payload.KilledTeam === "Neutral"
        );
        reference[actorName] = {
          "3:jungler": 1,
          "1:midlane": 0,
          "2:botlane": 0,
          "0:toplane": 0
        };
        if (minionType) {
          reference[actorName][minionType] += 1;
        }
      }
    }
  }

  damagesData.highest = damagesData.rosters.reduce((accu, currVa): any => {
    const highestInTeam = Object.keys(currVa).reduce(
      (accu2, currVa2) => Math.max(currVa[currVa2], accu2),
      0
    );
    return Math.max(highestInTeam, accu);
  }, 0);

  towersDamagesData.highest = towersDamagesData.rosters.reduce(
    (accu, currVa): any => {
      const highestInTeam = Object.keys(currVa).reduce(
        (accu2, currVa2) => Math.max(currVa[currVa2], accu2),
        0
      );
      return Math.max(highestInTeam, accu);
    },
    0
  );

  const gameplayRoles = getRoles(matchData, creepKills);

  return {
    damagesData,
    towersDamagesData,
    banData,
    creatures5v5,
    draftOrder,
    gameplayRoles
  };
};

const getRoles = (matchData, creepKills) => {
  console.log(creepKills);
  let roleDetection: string | boolean = false;
  if (
    matchData.rosters[0].participants.length +
      matchData.rosters[1].participants.length ===
      10 &&
    matchData.duration > 540
  ) {
    roleDetection = "5v5";
  } else if (
    matchData.rosters[0].participants.length +
      matchData.rosters[1].participants.length ===
      6 &&
    ["ranked", "private_party_draft_match", "casual", "private"].indexOf(
      matchData.gameMode
    ) > -1
  ) {
    roleDetection = "3v3";
  }

  if (roleDetection === "3v3") {
  }

  if (roleDetection === "5v5") {
    const creepKillMaxValues = [
      {
        "3:jungler": 0,
        "1:midlane": 0,
        "2:botlane": 0,
        "0:toplane": 0
      },
      {
        "3:jungler": 0,
        "1:midlane": 0,
        "2:botlane": 0,
        "0:toplane": 0
      }
    ];
    for (let i in creepKills) {
      for (let key in creepKills[i]) {
        for (let role in creepKillMaxValues[0]) {
          if (creepKills[i][key][role] > creepKillMaxValues[i][role]) {
            creepKillMaxValues[i][role] = creepKills[i][key][role];
          }
        }
      }
    }
    const gameplayRoles = [{}, {}];
    creepKills.forEach((side, sideIndex) => {
      Object.keys(side).forEach(actor => {
        for (let role in creepKillMaxValues[0]) {
          const actorRolesData = side[actor];
          if (gameplayRoles[sideIndex][actor] === "3:jungler") {
            const currentRole = actorRolesData["3:jungler"];
            const possibleRole = actorRolesData[role];
            if (currentRole > possibleRole * 2.5) {
              continue;
            }
          }
          if (
            actorRolesData[role] >=
              Math.max(
                ...Object.keys(actorRolesData)
                  .filter(e => e !== role)
                  .map(e => actorRolesData[e])
              ) &&
            actorRolesData[role] >=
              creepKillMaxValues[sideIndex][role] * (3 / 5)
          ) {
            gameplayRoles[sideIndex][actor] = role;
          } else if (
            actorRolesData[role] >=
            creepKillMaxValues[sideIndex][role] * (4 / 5)
          ) {
            gameplayRoles[sideIndex][actor] = role;
          }
        }
      });
    });

    matchData.rosters.forEach((side, rosterIndex) =>
      side.participants.forEach(p => {
        let supportPoints = 0;
        const supportQuantifiers = {
          heroes: [
            "Yates",
            "Adagio",
            "Ardan",
            "Catherine",
            "Churnwalker",
            "Flicker",
            "Fortress",
            "Grace",
            "Lance",
            "Lorelai",
            "Lyra",
            "Phinn"
          ],
          secondaryHerores: ["Glaive", "Grumpjaw", "Tony", "Baptiste"],
          items: [
            "Crucible",
            "Rook's Decree",
            "Fountain of Renewal",
            "War Treads",
            "Flare Gun",
            "Contraption",
            "Nullwave Gauntlet",
            "Ironguard Contract",
            "Protector Contract",
            "Dragonblood Contract",
            "ScoutPak",
            "ScoutTuff",
            "SuperScout 2000",
            "Flare Loader",
            "Capacitor Plate",
            "Atlas Pauldron"
          ],
          secondaryItems: [
            "Poisoned Shiv",
            "Spellfire",
            "Clockwork",
            "Aftershock",
            "Pulseweave",
            "Stormcrown",
            "Stormguard Banner",
            "Shiversteel",
            "Lifespring",
            "Tension Bow"
          ]
        };

        if (supportQuantifiers.heroes.indexOf(p.actor) > -1) {
          // console.log("+3", p.actor);
          supportPoints += 2.5;
        } else if (supportQuantifiers.secondaryHerores.indexOf(p.actor) > -1) {
          // console.log("+1", p.actor);
          supportPoints += 1;
        }

        p.items.forEach(i => {
          if (supportQuantifiers.items.indexOf(i) > -1) {
            // console.log("+1.5", i);
            supportPoints += 1.75;
          } else if (supportQuantifiers.secondaryItems.indexOf(i) > -1) {
            // console.log("+0.5", i);
            supportPoints += 0.5;
          }
        });
        if (
          supportPoints >= 4.4 * (p.items.length - 2 + 0.75) / 6 &&
          !gameplayRoles[rosterIndex][p.actor]
        ) {
          gameplayRoles[rosterIndex][p.actor] = "4:captain";
        } else if (supportPoints >= 8.4 * (p.items.length - 2 + 0.75) / 6) {
          //p.role = "4:captain";
        }
      })
    );
    return gameplayRoles;
  }

  return undefined;
};

const detectMinionType = (_, coords, jungle) => {
  if (jungle) {
    return "3:jungler";
  }
  if (
    coords[2] >= -65.0 &&
    coords[2] <= -47.5 &&
    coords[0] >= -21.3 &&
    coords[0] <= 21.3
  ) {
    return "0:toplane";
  }
  if (
    coords[2] >= -10.0 &&
    coords[2] <= 10.0 &&
    coords[0] >= -17.5 &&
    coords[0] <= 17.5
  ) {
    return "1:midlane";
  }
  if (
    coords[2] >= 47.5 &&
    coords[2] <= 65.0 &&
    coords[0] >= -21.3 &&
    coords[0] <= 21.3
  ) {
    return "2:botlane";
  }
  return undefined;
};
