import { Router, Request, Response } from "express";
const router = Router();

import { Match, IMatch } from "./../../models/Match";
import messenger from "./messenger";
import axios from "axios";

export default (nextApp: any): Router => {
  router.get("/", (req: Request, res: Response) => {
    nextApp.render(req, res, "/extension/player", {
      error: false,
      extension: true
    });
  });

  router.get("/player/:IGN", (req: Request, res: Response) => {
    nextApp.render(req, res, "/extension/player", {
      IGN: req.params.IGN,
      error: false,
      extension: false
    });
  });

  router.get("/player/:IGN/:matchID", (req: Request, res: Response) => {
    let matchData = undefined;
    Match.findOne({ matchID: req.params.matchID })
      .exec()
      .then((match: IMatch) => {
        if (match) {
          const aMonth = new Date();
          aMonth.setDate(new Date().getDate() - 27);
          if (new Date(match.createdAt) > aMonth && match.telemetryURL) {
            matchData = match;
          }
        }

        return axios(
          `${req.protocol}://${
            req.headers.host
          }/api/telemetry?match=${JSON.stringify(matchData)}`
        );
      })
      .then(axiosData => {
        nextApp.render(req, res, "/extension/player", {
          IGN: req.params.IGN,
          error: false,
          extension: false,
          matchData: {
            match: matchData,
            TLData: axiosData.data
          }
        });
      })
      .catch(err => {
        console.error(err);
        nextApp.render(req, res, "/extension/player", {
          IGN: req.params.IGN,
          error: false,
          extension: false
        });
      });
  });

  router.use("/messenger", messenger);

  return router;
};
