"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const uuidv4 = require('uuid/v4');
exports.default = router;
router.get('/', (req, res) => {
    const param = parseInt(req.query.n);
    const n = typeof param === 'number' &&
        isFinite(param) &&
        Math.floor(param) === param &&
        Math.abs(param) === param
        ? param
        : 1;
    res.json(new Array(...new Array(n)).map(() => uuidv4()));
});
//# sourceMappingURL=uuidv4.js.map