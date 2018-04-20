"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const getData_1 = require("./../functions/getData");
exports.default = router;
router.get("/", (req, res) => {
    getData_1.default(req.query.IGN)
        .then((data) => {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.write(JSON.stringify(data));
        res.end();
    })
        .catch(error => {
        res.writeHead(200, {
            // 200 to handle error myself, otherwise it renders 404 page
            "Content-Type": "application/json"
        });
        res.write(JSON.stringify({
            error: true,
            errorMessage: error
        }));
        res.end();
    });
});
//# sourceMappingURL=matches.js.map