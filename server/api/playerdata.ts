import { Router } from "express";
const router: Router = Router();
import cacheMW from "./../../functions/cacheMW";

import { Player } from "./../../models/Player";
import getData from "./../../functions/getData";

export default router;

router.get("/", cacheMW(60), (req, res) => {
  getData({ IGN: req.query.IGN, playerID: req.query.playerID })
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      if (err.message == "404" && req.query.IGN) {
        Player.find({
          IGNHistory: req.query.IGN,
          playerID: { $exists: true }
        })
          .exec()
          .then(players => {
            if (players && players.length) {
              res.json({
                error: true,
                errorMessage: "404",
                errorData: players.map(p => ({
                  name: p.name,
                  playerID: p.playerID
                }))
              });
            } else {
              res.json({
                error: true,
                errorMessage: "404"
              });
            }
          })
          .catch(errDB => {
            console.error(errDB);
            res.json({
              error: true,
              errorMessage: "404"
            });
          });
      } else {
        res.json({
          error: true,
          errorMessage: err.message
        });
      }
    });
});
