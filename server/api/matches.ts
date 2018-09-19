import { Router } from "express";
const router: Router = Router();
import cacheMW from "./../../functions/cacheMW";

import getData from "./../../functions/getData";

export default router;

router.get("/", cacheMW(60), (req, res) => {
  getData({ IGN: req.query.IGN, playerID: req.query.playerID })
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json({
        error: true,
        errorMessage: err.message
      });
    });
});
