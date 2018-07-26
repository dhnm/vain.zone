import { Router, Request, Response } from "express";
const router: Router = Router();
import cacheMW from "./../functions/cacheMW";

import { Player, IPlayer } from "./../../models/Player";
import rankData from "./../functions/rankData";
import skillTierCalculator from "./../functions/skillTierCalculator";

import axios from "axios";

export default router;

const percentRank = n => {
  const array = rankData;
  var L = 0;
  var S = 0;
  var N = array.length;

  for (var i = 0; i < array.length; i++) {
    if (array[i] < n) {
      L += 1;
    } else if (array[i] === n) {
      S += 1;
    }
  }

  var pct = (L + 0.5 * S) / N;

  return pct;
};

router.get("/en", (_, res: Response): void => {
  res.json({ error: true });
});

router.get("/en/:IGN", cacheMW(3600), (req: Request, res: Response): void => {
  Player.findOne({ name: req.params.IGN })
    .exec()
    .then((player: IPlayer) => {
      if (player) {
        const playersPercentRank = percentRank(player.rank_5v5) * 100;
        const processedSkillTier = skillTierCalculator(player.rank_5v5);
        sendSuccessMessage(res, req, playersPercentRank, processedSkillTier);
      } else {
        throw new Error("Not found in DB!");
      }
    })
    .catch(() => {
      axios("https://api.vgpro.gg/player/Excoundrel/stats?season=summer18")
        .then(axiosResponse => {
          const vgproData = axiosResponse.data;
          if (typeof vgproData.rank5v5Vst === "string") {
            const playersPercentRank =
              percentRank(Number(vgproData.rank5v5Vst)) * 100;
            const processedSkillTier = skillTierCalculator(
              Number(vgproData.rank5v5Vst)
            );
            sendSuccessMessage(
              res,
              req,
              playersPercentRank,
              processedSkillTier
            );
          } else {
            throw new Error("Old or non-existing data");
          }
        })
        .catch(error => {
          console.error(error);
          res.send(`
          <!doctype html>
          <html prefix="og: http://ogp.me/ns#">
          <head>
            <title>VAIN.ZONE TOP</title>
            <meta
              name="viewport"
              content="initial-scale=1.0, width=device-width, shrink-to-fit=no"
            />
            <meta property="fb:app_id" content="617200295335676" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="${req.params.IGN} not found." />
            <meta property="og:description" content="Player is not in the database." />
            <meta property="og:url" content="https://vain.zone/top/en/${
              req.params.IGN
            }?err=true" />
            <meta property="og:image" content="https://vain.zone/static/img/draft/logo.png" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="250" />
            <meta property="og:image:height" content="250" />
            <meta property="og:image:alt" content="VAIN.ZONE" />
          </head>
          <body>
            <p>${req.params.IGN} is not in the database.</p>
          </body>
          </html>
          `);
        });
    });
});

function sendSuccessMessage(res, req, playersPercentRank, processedSkillTier) {
  res.send(`
          <!doctype html>
          <html prefix="og: http://ogp.me/ns#"y>
          <head prefix>
            <title>VAIN.ZONE TOP</title>
            <meta
              name="viewport"
              content="initial-scale=1.0, width=device-width, shrink-to-fit=no"
            />
            <meta property="fb:app_id" content="617200295335676" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="${
              req.params.IGN
            } is in TOP ${Math.ceil(100 - playersPercentRank)}%!" />
            <meta property="og:description" content="${
              req.params.IGN
            } is ranked higher than ${Math.floor(
    playersPercentRank
  )}% of all Vainglory players!" />
            <meta property="og:url" content="https://vain.zone/top/en/${
              req.params.IGN
            }" />
            <meta property="og:image" content="https://vain.zone/static/img/rank/c/${
              processedSkillTier.number
            }%20${processedSkillTier.color.trim()}.png" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="300" />
            <meta property="og:image:height" content="300" />
            <meta property="og:image:alt" content="${processedSkillTier.name}${
    processedSkillTier.color
  }" />
          </head>
          <body>
            <p>Paste the link to this page on Facebook, Twitter or Discord to find out your percentile!</p>
          </body>
          </html>
          `);
}

router.get("/:IGN", cacheMW(3600), (req: Request, res: Response): void => {
  Player.findOne({ name: req.params.IGN })
    .exec()
    .then((player: IPlayer) => {
      if (player) {
        const playersPercentRank = percentRank(player.rank_5v5) * 100;
        const processedSkillTier = skillTierCalculator(player.rank_5v5);
        res.send(`
          <!doctype html>
          <html prefix="og: http://ogp.me/ns#"y>
          <head prefix>
            <title>VAIN.ZONE TOP</title>
            <meta
              name="viewport"
              content="initial-scale=1.0, width=device-width, shrink-to-fit=no"
            />
            <meta property="fb:app_id" content="617200295335676" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="${
              player.name
            } je v TOP ${Math.ceil(100 - playersPercentRank)} %!" />
            <meta property="og:description" content="${
              player.name
            } je lepší než ${Math.floor(
          playersPercentRank
        )} % všech hráčů Vainglory na světě." />
            <meta property="og:url" content="https://vain.zone/top/${
              player.name
            }" />
            <meta property="og:image" content="https://vain.zone/static/img/rank/c/${
              processedSkillTier.number
            }%20${processedSkillTier.color.trim()}.png" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="300" />
            <meta property="og:image:height" content="300" />
            <meta property="og:image:alt" content="${processedSkillTier.name}${
          processedSkillTier.color
        }" />
          </head>
          <body>
            <p>Nepostupuješ podle návodu! Vlož odkaz na tuto stránku do komentářů na Facebooku a zjistíš, v jakém percentilu se nacházíš!</p>
            <p><a href="https://m.me/VAIN.ZONE">Přejít na Messenger Bot</a></p>
          </body>
          </html>
          `);
      } else {
        throw new Error("Not found in DB!");
      }
    })
    .catch(err => {
      // https://api.vgpro.gg/player/Excoundrel/stats?season=summer18
      console.error(err);
      res.send(`
          <!doctype html>
          <html prefix="og: http://ogp.me/ns#">
          <head>
            <title>VAIN.ZONE TOP</title>
            <meta
              name="viewport"
              content="initial-scale=1.0, width=device-width, shrink-to-fit=no"
            />
            <meta property="fb:app_id" content="617200295335676" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="${
              req.params.IGN
            } není v databázi." />
            <meta property="og:description" content="Klikni sem a zkus nick vyhledat v Messenger Botovi." />
            <meta property="og:url" content="https://vain.zone/top/${
              req.params.IGN
            }?err=true" />
            <meta property="og:image" content="https://vain.zone/static/img/draft/logo.png" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="250" />
            <meta property="og:image:height" content="250" />
            <meta property="og:image:alt" content="VAIN.ZONE" />
          </head>
          <body>
            <p>${req.params.IGN} není v naší databázi.</p>
            <p><a href="https://m.me/VAIN.ZONE">Klikni sem a vyzkoušej náš Messenger Bot!</a></p>
            <script type="text/javascript">
              window.location.replace("https://m.me/VAIN.ZONE");
            </script>
          </body>
          </html>
          `);
    });
});
