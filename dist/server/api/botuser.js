"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const cacheMW_1 = require("./../../functions/cacheMW");
const BotUser_1 = require("./../../models/BotUser");
exports.default = router;
router.get("/", cacheMW_1.default(60), (req, res) => {
    BotUser_1.BotUser.findOne({ psid: req.query.psid })
        .exec()
        .then(botUser => {
        if (botUser) {
            res.json({
                currentUser: true,
                defaultIGN: botUser.defaultIGN
            });
        }
        else {
            res.json({ currentUser: false });
        }
    })
        .catch(err => {
        console.log(err);
        res.status(500).json({ currentUser: false });
    });
});
//# sourceMappingURL=botuser.js.map