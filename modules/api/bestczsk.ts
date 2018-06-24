import { Router, Response } from 'express';
const router: Router = Router();

import { Player, IPlayer } from './../../models/Player';
import { axiosAPI } from './../functions/getData';

export default router;

router.get('/', (_, res: Response): void => {
  Player.find({ czSk: { $exists: true } })
    .exec()
    .then((players: IPlayer[]) => {
      if (players && players.length > 0) {
        const toBeUpdated: IPlayer[] = [];
        const now = new Date();

        players.forEach((p) => {
          const retrievalDate = new Date(p.czSk.retrieval);
          if (
            !p.czSk.retrieval ||
            retrievalDate.setDate(retrievalDate.getDate() + 3) <=
              now.getTime() ||
            p.czSk.of_month != now.getMonth()
          ) {
            toBeUpdated.push(p);
          }
        });

        const requestLimit = 8;
        toBeUpdated
          .sort((a, b) => b.rank_5v5 - a.rank_5v5)
          .splice(6 * requestLimit, toBeUpdated.length - 6 * requestLimit);

        const axiosArray: any[] = [];
        for (let i = 0; i < toBeUpdated.length / 6; i++) {
          axiosArray.push(
            axiosAPI({
              shardId: 'eu',
              endPoint: 'players',
              params: {
                'filter[playerIds]': toBeUpdated
                  .slice(i * 6, i * 6 + 5)
                  .map((e) => e.playerID)
                  .join(','),
              },
            }),
          );
        }

        Promise.all(axiosArray)
          .then((axiosData) => {
            const freshPlayerData = [].concat(...axiosData.map((e) => e.data));
            freshPlayerData.forEach((e) => {
              const relevantPlayer = toBeUpdated.find(
                (p) => p.playerID === e.id,
              );
              relevantPlayer.rank_5v5 =
                e.attributes.stats.rankPoints.ranked_5v5;
              relevantPlayer.czSk.retrieval = now;
              if (relevantPlayer.czSk.of_month != now.getMonth()) {
                relevantPlayer.czSk.of_month = now.getMonth();
                relevantPlayer.czSk.first_of_month =
                  e.attributes.stats.rankPoints.ranked_5v5;
              }
              relevantPlayer.save();
            });

            res.json({
              players: players
                .map((p) => ({
                  name: p.name,
                  rankPoints: p.rank_5v5,
                  first_of_month: p.czSk.first_of_month,
                }))
                .sort((a, b) => b.rankPoints - a.rankPoints),
            });
          })
          .catch((err) => {
            console.error(err);
            res.json({
              players: players
                .map((p) => ({
                  name: p.name,
                  rankPoints: p.rank_5v5,
                  first_of_month: p.czSk.first_of_month,
                }))
                .sort((a, b) => b.rankPoints - a.rankPoints),
            });
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.json({});
    });
});
