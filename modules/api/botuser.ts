const express = require("express");
const router = express.Router();

const BotUser = require("./../../models/BotUser");

module.exports = router;

router.get("/", (req, res) => {
    BotUser.findOne({ psid: req.query.psid })
        .exec()
        .then(user => {
            if (user) {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.write(
                    JSON.stringify({
                        currentUser: true,
                        defaultIGN: user.defaultIGN
                    })
                );
                res.end();
            } else {
                return Promise.reject("Not a current user.");
            }
        })
        .catch(err => {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.write(JSON.stringify({ currentUser: false }));
            res.end();
        });
});
