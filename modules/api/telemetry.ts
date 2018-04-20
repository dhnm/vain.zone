import { Router, Response, Request } from "express";
const router: Router = Router();

import axios, { AxiosResponse } from "axios";

export default router;

export type IOutput = {
  damageData?: IDamages;
  banData?: IBans;
  error: boolean;
};

router.get("/", (req: Request, res: Response): void => {
  axios({
    method: "get",
    url: JSON.parse(req.query.match).telemetryURL,
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
      const damageData = calculateDamagesFromTelemetry(
        telemetryData,
        JSON.parse(req.query.match)
      );

      const banData = detectBans(telemetryData);

      const output: IOutput = {
        damageData: damageData,
        banData: banData,
        error: false
      };

      res.writeHead(200, {
        "Content-Type": "application/json"
      });
      res.write(JSON.stringify(output));
      res.end();
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

export type IDamages = {
  rosters: { [key: string]: number }[];
  highest: number;
};

const calculateDamagesFromTelemetry = (
  telemetry: any,
  match: any
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
            e.type === "DealDamage" &&
            e.payload.Actor ===
              "*" +
                match.rosters[rosterIndex].participants[participantIndex]
                  .actor +
                "*" &&
            e.payload.Team == ["Left", "Right"][rosterIndex]
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

  telemetry.filter((e: any) => e.type == "HeroBan").forEach((e: any) => {
    rostersBans[parseInt(e.payload.Team) - 1].push(
      e.payload.Hero.substring(1, e.payload.Hero.length - 1)
    );
  });

  const bansData: IBans = { rosters: rostersBans };

  return bansData;
};
