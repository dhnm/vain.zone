import { Router, Response } from "express";
const router: Router = Router();
import cacheMW from "./../functions/cacheMW";

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
        mixedRank: `${p.processedRankPoints.number}${
          p.processedRankPoints.color
        }`,
        lastUpdated: p.czSk.retrieval
      }))
      .sort((a, b) => b.rankPoints - a.rankPoints),
    byGrowth: players
      .map(p => {
        let growthPoints =
          (p.rank_5v5 - p.czSk.first_of_month) *
            Math.sqrt(p.processedRankPoints.skillTier) +
          p.rank_5v5 / 77;
        if (p.rank_5v5 > 2400 && p.czSk.first_of_month < 2400) {
          growthPoints =
            (p.rank_5v5 - p.czSk.first_of_month) * Math.sqrt(26.26) +
            p.rank_5v5 / 77 +
            (p.rank_5v5 - 2400) *
              (Math.sqrt(p.processedRankPoints.skillTier) * 2 - // * 4 eventually
                Math.sqrt(26));
        }
        growthPoints = growthPoints * 10 / 3;
        return { name: p.name, growthPoints };
      })
      .sort((a, b) => b.growthPoints - a.growthPoints)
  };
};

router.get("/", cacheMW(30), (_, res: Response): void => {
  CzSk.find({})
    .exec()
    .then((czSkPlayers: ICzSk[]) =>
      Player.find({
        name: { $in: czSkPlayers.map(p => p.name) },
        exists: true
      }).exec()
    )
    .then((players: IPlayer[]) => {
      if (players && players.length > 0) {
        const toBeUpdated: IPlayer[] = [];
        const now = new Date();

        players.forEach(p => {
          if (!p.czSk) p.czSk = {};
          const czSkRetrievalDate = new Date(p.czSk.retrieval);
          const retrievalDate = new Date(p.retrieval);
          if (!p.czSk.retrieval || p.czSk.of_month != now.getMonth()) {
            toBeUpdated.push(p);
          } else if (
            czSkRetrievalDate.setDate(czSkRetrievalDate.getDate() + 1) <=
            now.getTime()
          ) {
            if (
              retrievalDate.setDate(retrievalDate.getDate() + 1) <=
              now.getTime()
            ) {
              toBeUpdated.push(p);
            } else {
              p.czSk.retrieval = p.retrieval;
              p.save();
            }
          }
        });

        const requestLimit = 7;
        toBeUpdated
          .sort((a, b) => b.rank_5v5 - a.rank_5v5)
          .splice(6 * requestLimit, toBeUpdated.length - 6 * requestLimit);
        // can call 6 names in one request

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

              if (e.attributes.patchVersion >= "3.7") {
                relevantPlayer.rank_5v5 =
                  e.attributes.stats.rankPoints.ranked_5v5;

                if (
                  relevantPlayer.czSk.of_month != now.getMonth() ||
                  relevantPlayer.czSk.first_of_month === 9999
                ) {
                  relevantPlayer.czSk.of_month = now.getMonth();
                  relevantPlayer.czSk.first_of_month =
                    e.attributes.stats.rankPoints.ranked_5v5 >= 1090
                      ? e.attributes.stats.rankPoints.ranked_5v5
                      : 1090;
                }
              } else {
                relevantPlayer.rank_5v5 = 0;

                if (relevantPlayer.czSk.of_month != now.getMonth()) {
                  relevantPlayer.czSk.of_month = now.getMonth();
                  relevantPlayer.czSk.first_of_month = 9999;
                }
              }
              relevantPlayer.czSk.retrieval = now;
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
