import { Router, Response, Request } from 'express';
const router: Router = Router();

import axios, { AxiosResponse } from 'axios';
import { IMatch } from 'models/Match';

import { gameModeDict } from './../functions/constants';

export default router;

export type IOutput = {
  damageData?: IDamages;
  banData?: IBans;
  rankPoints?: IRankPoints;
  error: boolean;
};

router.get('/', (req: Request, res: Response): void => {
  const matchData = JSON.parse(req.query.match);
  axios({
    method: 'get',
    url: matchData.telemetryURL,
    headers: {
      'Content-Encoding': 'gzip',
      'Content-Type': 'application/json',
      'User-Agent': 'js/vainglory',
      'X-TITLE-ID': 'semc-vainglory',
      Accept: 'application/json',
    },
  })
    .then((response: AxiosResponse<any>): any => {
      console.log('obtaining telemetry with status', response.status);
      return response.data;
    })
    .then((telemetryData: any): void => {
      const damageData = calculateDamagesFromTelemetry(
        telemetryData,
        matchData,
      );

      const banData = detectBans(telemetryData);

      getRankPoints(matchData).then((rankPoints) => {
        const output: IOutput = {
          damageData: damageData,
          banData: banData,
          rankPoints: rankPoints,
          error: false,
        };

        res.writeHead(200, {
          'Content-Type': 'application/json',
        });
        res.write(JSON.stringify(output));
        res.end();
      });
    })
    .catch(function(error) {
      const output: IOutput = {
        error: true,
      };
      res.writeHead(404, {
        'Content-Type': 'application/json',
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
            } ${JSON.stringify(error.response.headers)}`,
          );
        }

        console.log(
          `${JSON.stringify(error.response.data)} ${
            error.response.status
          } ${JSON.stringify(error.response.headers)}`,
        );
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      console.log(error.config);
    });
});

export type IDamages = {
  rosters: { [key: string]: number }[];
  highest: number;
};

const calculateDamagesFromTelemetry = (
  telemetry: any,
  match: any,
): IDamages => {
  const damagesData: IDamages = { rosters: [{}, {}], highest: 0 };

  for (let rosterIndex = 0; rosterIndex < match.rosters.length; rosterIndex++) {
    for (
      let participantIndex = 0;
      participantIndex < match.rosters[rosterIndex].participants.length;
      participantIndex++
    ) {
      const totalDamage: number = telemetry
        .filter(
          (e: any) =>
            e.type === 'DealDamage' &&
            e.payload.Actor ===
              '*' +
                match.rosters[rosterIndex].participants[participantIndex]
                  .actor +
                '*' &&
            e.payload.Team == ['Left', 'Right'][rosterIndex],
        )
        .map((e: any) => e.payload.Dealt)
        .reduce((a: number, b: number) => a + b, 0);

      if (totalDamage > damagesData.highest) {
        damagesData.highest = totalDamage;
      }

      damagesData.rosters[rosterIndex][
        match.rosters[rosterIndex].participants[participantIndex].actor
      ] = totalDamage;
    }
  }

  return damagesData;
};

export type IBans = {
  rosters: string[][];
};

const detectBans = (telemetry: any): IBans => {
  const rostersBans: any[][] = [[], []];

  telemetry.filter((e: any) => e.type == 'HeroBan').forEach((e: any) => {
    rostersBans[parseInt(e.payload.Team) - 1].push(
      e.payload.Hero.substring(1, e.payload.Hero.length - 1),
    );
  });

  const bansData: IBans = { rosters: rostersBans };

  return bansData;
};

export type IRankPoints = {
  [key: string]: number;
};

const getRankPoints = (matchData: IMatch): Promise<IRankPoints> => {
  return axios({
    method: 'get',
    url: `https://api.dc01.gamelockerapp.com/shards/${
      matchData.shardId
    }/matches/${matchData.matchID}`,
    headers: {
      'Content-Encoding': 'gzip',
      'Content-Type': 'application/json',
      'User-Agent': 'js/vainglory',
      Authorization:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxYWIwYmFhMC0xZTYxLTAxMzYtNGMyOC0wYTU4NjQ2MDBlZGYiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTIzMzA1MTE1LCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiJ2YWluLXpvbmUiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.WRRbcDammhPrqWhDPenutkXJdCbGv3CpxvwscPyQK9Y',
      'X-TITLE-ID': 'semc-vainglory',
      Accept: 'application/vnd.api+json',
    },
  })
    .then((response: AxiosResponse<any>): any => {
      console.log('obtaining single match data with status', response.status);
      return response.data;
    })
    .then((match: any): IRankPoints => {
      const rankPoints: IRankPoints = {};

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
            (e: any) => e.id === currentParticipant.player.id,
          );

          rankPoints[currentParticipant.player.name] =
            player.attributes.stats.rankPoints[
              gameModeDict[matchData.gameMode][2]
            ];
        }
      }
      return rankPoints;
    })
    .catch((error) => {
      console.error(error);

      return {};
    });
};
