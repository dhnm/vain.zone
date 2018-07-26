import { Router, Response } from "express";
const router: Router = Router();
import cacheMW from "./../functions/cacheMW";

import { axiosAPI } from "./../functions/getData";
import skillTierCalculator from "./../functions/skillTierCalculator";
import { testingApiKey } from "./../functions/constants";

export default router;

router.get("/", cacheMW(300), (_, res: Response): void => {
  const playerID = "682fecfc-d732-11e6-9b38-06388a2f2ea7";
  const axiosArray: any[] = [];
  for (let i = 0; i < 10; i++) {
    axiosArray.push(
      axiosAPI({
        shardId: "eu",
        endPoint: "matches",
        params: {
          "page[offset]": i,
          "page[limit]": 1,
          sort: "-createdAt", // -
          "filter[playerIds]": playerID,
          "filter[gameMode]": "5v5_pvp_ranked"
          // "filter[createdAt-start]": "2018-06-15T12:36:00Z", // delet
          // "filter[createdAt-end]": "2018-06-22T12:36:00Z"
        },
        key: testingApiKey
      }).catch(e => ({ e }))
    );
  }

  Promise.all(axiosArray)
    .then(axiosData => {
      const retrievedData = axiosData.filter(e => !e.e).map(e => {
        const player = e.included.find(e2 => e2.id === playerID);
        return {
          name: player.attributes.name,
          rankPoints: player.attributes.stats.rankPoints.ranked_5v5,
          createdAt: e.data[0].attributes.createdAt
        };
      });

      const output = retrievedData.map((data, i) => {
        const processed = skillTierCalculator(data.rankPoints);
        const diff = retrievedData[i - 1]
          ? retrievedData[i - 1].rankPoints - data.rankPoints
          : undefined;

        return {
          name: data.name,
          from: data.createdAt,
          rankPoints: data.rankPoints,
          rank: `${processed.name} ${processed.color}`,
          elo_gain: diff
        };
      });
      const result = { length: output.length, output };
      res.json(result);
    })
    .catch(err => {
      console.error(err);
      res.json({ error: true });
    });
});
