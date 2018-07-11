import { Router, Response } from 'express';
const router: Router = Router();

import { axiosAPI } from './../functions/getData';
import skillTierCalculator from './../functions/skillTierCalculator';

export default router;

router.get(
  '/',
  (_, res: Response): void => {
    const axiosArray: any[] = [];
    for (let i = 0; i < 10; i++) {
      axiosArray.push(
        axiosAPI({
          shardId: 'eu',
          endPoint: 'matches',
          params: {
            'page[offset]': i,
            'page[limit]': 1,
            sort: '-createdAt',
            'filter[playerIds]': '682fecfc-d732-11e6-9b38-06388a2f2ea7',
            'filter[gameMode]': '5v5_pvp_ranked',
          },
          key:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI5ZGI0MTNjMC02NzE0LTAxMzYtOTQ4Mi0wYTU4NjQ2MTRkYjUiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTMxMjk4Njk4LCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiJ0ZW1wX3Rlc3QiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.kZZ1kSvyT447fc_hKmvoZ5qXUmXWftX2eYrYzL6ganE',
        }),
      );
    }

    Promise.all(axiosArray)
      .then((axiosData) => {
        const retrievedData = axiosData.map((e) => {
          const player = e.included.find(
            (e2) => e2.id === '682fecfc-d732-11e6-9b38-06388a2f2ea7',
          );

          return {
            name: player.attributes.name,
            rankPoints: player.attributes.stats.rankPoints.ranked_5v5,
            createdAt: e.data.createdAt,
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
            elo_gain: diff,
          };
        });
        res.json(output);
      })
      .catch((err) => {
        console.error(err);
        res.json({ error: true });
      });
  },
);
