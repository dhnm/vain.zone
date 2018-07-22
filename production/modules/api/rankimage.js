"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const path = require("path");
exports.default = router;
router.use("/c", express_1.static(path.join(process.env.PWD, "/static/img/rank/c")));
router.get("/c/:mixed_rank", (req, res) => {
    res.sendFile(path.join(process.env.PWD, `/static/img/rank/c/${req.params.mixed_rank}.png`));
});
//# sourceMappingURL=rankimage.js.map