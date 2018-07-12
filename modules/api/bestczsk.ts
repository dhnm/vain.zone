import { Router, Response } from "express";
const router: Router = Router();

import { Player, IPlayer } from "./../../models/Player";
import { CzSk, ICzSk } from "./../../models/CzSk";
import { axiosAPI } from "./../functions/getData";
import skillTierCalculator from "./../functions/skillTierCalculator";

export default router;

const output = players => {
  players.forEach(
    p => (p.processedRankPoints = skillTierCalculator(p.rank_5v5))
  );
  return {
    byRank: players
      .map(p => ({
        name: p.name,
        rankPoints: p.rank_5v5,
        mixedRank: `${p.processedRankPoints.number} ${
          p.processedRankPoints.color
        }`
      }))
      .sort((a, b) => b.rankPoints - a.rankPoints),
    byGrowth: players
      .map(p => {
        const growthPoints =
          (p.rank_5v5 - p.czSk.first_of_month) *
            (p.processedRankPoints.skillTier * 2 / 3) +
          p.rank_5v5 / 10000;
        return { name: p.name, growthPoints };
      })
      .sort((a, b) => b.growthPoints - a.growthPoints)
  };
};

router.get("/", (_, res: Response): void => {
  CzSk.find({})
    .exec()
    .then((czSkPlayers: ICzSk[]) =>
      Player.find({
        name: { $in: czSkPlayers.map(p => p.name) }
      }).exec()
    )
    .then((players: IPlayer[]) => {
      if (players && players.length > 0) {
        const toBeUpdated: IPlayer[] = [];
        const now = new Date();

        players.forEach(p => {
          if (!p.czSk) p.czSk = {};
          const retrievalDate = new Date(p.czSk.retrieval);
          if (
            !p.czSk.retrieval ||
            retrievalDate.setDate(retrievalDate.getDate() + 1) <=
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
              shardId: "eu",
              endPoint: "players",
              params: {
                "filter[playerIds]": toBeUpdated
                  .slice(i * 6, i * 6 + 5)
                  .map(e => e.playerID)
                  .join(",")
              }
            })
          );
        }

        Promise.all(axiosArray)
          .then(axiosData => {
            // const freshPlayerData = [].concat(
            //   ...axiosData.map((e) => e.data),
            // );
            const freshPlayerData = [].concat(...axiosData.map(e => e.data));
            freshPlayerData.forEach(e => {
              const relevantPlayer = toBeUpdated.find(p => p.playerID === e.id);

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

            res.json(output(players));
          })
          .catch(err => {
            console.error(err);
            res.json(output(players));
          });
      } else {
        throw new Error("No CZSK players found.");
      }
    })
    .catch(err => {
      console.error(err);
      res.json({});
    });
});
