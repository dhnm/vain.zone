"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const BotUser_1 = require("./../../models/BotUser");
exports.default = router;
router.get("/", (req, res) => {
    BotUser_1.BotUser.findOne({ psid: req.query.psid })
        .exec()
        .then((botUser) => {
        if (botUser) {
            const output = {
                currentUser: true,
                defaultIGN: botUser.defaultIGN
            };
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.write(JSON.stringify(output));
            res.end();
        }
        else {
            return Promise.reject("Not a current user.");
        }
    })
        .catch((err) => {
        const output = { currentUser: false };
        console.log(err);
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.write(JSON.stringify(output));
        res.end();
    });
});
//# sourceMappingURL=botuser.js.map