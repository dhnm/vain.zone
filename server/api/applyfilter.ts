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

router.get("/", cacheMW(60), (req, res) => {
  const filters = JSON.parse(req.query.filters);

  const createdAt = filters.createdAt ? new Date(filters.createdAt) : undefined;
  if (createdAt) {
    createdAt.setMilliseconds(createdAt.getMilliseconds() - 1);
  }

  axiosAPI({
    shardId: req.query.shardId,
    endPoint: "matches",
    params: {
      "filter[createdAt-end]": createdAt,
      "page[limit]": 12,
      sort: "-createdAt",
      "filter[playerIds]": req.query.playerID,
      "filter[gameMode]": filters.gameMode
    },
    key: serverRuntimeConfig.filterApiKey
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
