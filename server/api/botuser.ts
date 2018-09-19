import { Router } from "express";
const router: Router = Router();
import cacheMW from "./../../functions/cacheMW";

import { BotUser } from "./../../models/BotUser";

export default router;

router.get("/", cacheMW(60), (req, res) => {
    BotUser.findOne({ psid: req.query.psid })
        .exec()
        .then(botUser => {
            if (botUser) {
                res.json({
                    currentUser: true,
                    defaultIGN: botUser.defaultIGN
                });
            } else {
                res.json({ currentUser: false });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ currentUser: false });
        });
});
