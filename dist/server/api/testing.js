"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
exports.default = router;
router.get("/", (_, res) => {
    res.json({ ping: "pong" });
});
//# sourceMappingURL=testing.js.map