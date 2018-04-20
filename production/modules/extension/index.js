"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const messenger_1 = require("./messenger");
exports.default = (app) => {
    router.get("/", (req, res) => {
        app.render(req, res, "/extension/player", {
            error: false,
            extension: true
        });
    });
    router.get("/player/:IGN", (req, res) => {
        app.render(req, res, "/extension/player", {
            IGN: req.params.IGN,
            error: false,
            extension: false
        });
    });
    router.use("/messenger", messenger_1.default);
    return router;
};
//# sourceMappingURL=index.js.map