import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
import cacheMW from "./../../functions/cacheMW";

import { Router } from "express";
const router = Router();

import {
  axiosAPI,
  insertMatchesToDB,
  formatMatch
} from "./../../functions/getData";

export default router;

router.get("/", cacheMW(60), (req: any, res) => {
  let filters;

  try {
    filters = JSON.parse(req.query.filters);
    if (!filters || !req.query.shardId || !req.query.playerID) {
      throw new Error("Missing request arguments.");
    }
    filters.matches = filters.matches > 0 ? filters.matches : 12;
  } catch (error) {
    console.error(error);
    res.status(400).end();
    return;
  }

  const createdAt = filters.createdAt ? new Date(filters.createdAt) : undefined;
  if (createdAt) {
    createdAt.setSeconds(createdAt.getSeconds() - 1);
  }

  axiosAPI({
    shardId: req.query.shardId,
    endPoint: "matches",
    params: {
      "filter[createdAt-end]": createdAt,
      "page[limit]": filters.matches,
      sort: "-createdAt",
      "filter[playerIds]": req.query.playerID,
      "filter[gameMode]": filters.gameMode
    },
    key: req.gloryStatsKey || serverRuntimeConfig.filterApiKey
  })
    .then(matchesData => {
      if (matchesData) {
        const matches = matchesData.data.reduce((accu, m) => {
          const formattedMatch = formatMatch(m, matchesData.included);
          if (formattedMatch) {
            accu.push(formattedMatch);
          }
          return accu;
        }, []);

        res.json({ matches });

        insertMatchesToDB(matches).catch(err => console.error(err));
      } else {
        res.status(404).end();
      }
    })
    .catch(err => {
      console.error(err.message);
      res.status(404).end();
    });
});
