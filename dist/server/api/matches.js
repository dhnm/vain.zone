"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const cacheMW_1 = require("./../../functions/cacheMW");
const getData_1 = require("./../../functions/getData");
exports.default = router;
router.get("/", cacheMW_1.default(60), (req, res) => {
    getData_1.default({ IGN: req.query.IGN, playerID: req.query.playerID })
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
//# sourceMappingURL=matches.js.map