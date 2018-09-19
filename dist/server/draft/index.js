"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
exports.default = (nextApp) => {
    router.get('/', (req, res) => {
        nextApp.render(req, res, '/draft', {
            urlPath: req.protocol + '://' + req.headers.host,
        });
    });
    router.get('/:roomID', (req, res) => {
        nextApp.render(req, res, '/draft', {
            urlPath: req.protocol + '://' + req.headers.host,
            roomID: decodeURIComponent(req.params.roomID),
        });
    });
    router.get('/:roomID/:teamID', (req, res) => {
        nextApp.render(req, res, '/draft', {
            urlPath: req.protocol + '://' + req.headers.host,
            roomID: decodeURIComponent(req.params.roomID),
            teamID: req.params.teamID,
        });
    });
    return router;
};
//# sourceMappingURL=index.js.map