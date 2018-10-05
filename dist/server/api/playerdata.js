"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const cacheMW_1 = require("./../../functions/cacheMW");
const Player_1 = require("./../../models/Player");
const getData_1 = require("./../../functions/getData");
exports.default = router;
router.get("/", cacheMW_1.default(60), (req, res) => {
    getData_1.default({ IGN: req.query.IGN, playerID: req.query.playerID })
        .then(data => {
        res.json(data);
    })
        .catch(err => {
        if (err.message == "404" && req.query.IGN) {
            Player_1.Player.find({
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
                }
                else {
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
        }
        else {
            res.json({
                error: true,
                errorMessage: err.message
            });
        }
    });
});
//# sourceMappingURL=playerdata.js.map