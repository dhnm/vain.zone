"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const fbattachment_1 = require("./fbattachment");
const botuser_1 = require("./botuser");
const playerdata_1 = require("./playerdata");
const telemetry_1 = require("./telemetry");
const filtermatches_1 = require("./filtermatches");
const bestczsk_1 = require("./bestczsk");
const rankimage_1 = require("./rankimage");
const percentrank_1 = require("./percentrank");
const testing_1 = require("./testing");
const fame_1 = require("./fame");
const vgnews_1 = require("./vgnews");
const uuidv4_1 = require("./uuidv4");
exports.default = router;
const config_1 = require("next/config");
const { serverRuntimeConfig } = config_1.default();
router.use((req, res, next) => {
    if (req.get("X-Authorization") === serverRuntimeConfig.gloryStatsKey) {
        console.log("GloryStats authorized.");
        console.log(req.headers);
        req.gloryStatsKey = serverRuntimeConfig.gloryStatsKey;
        return next();
    }
    else if (true || res.get("Access-Control-Allow-Origin") /* && req.headers['X-SIGN-ID'] === "Z3dy7U" */) {
        return next();
    }
    res.status(403).end();
    return;
});
router.use("/fbattachment", fbattachment_1.default);
router.use("/botuser", botuser_1.default);
router.use("/playerdata", playerdata_1.default);
router.use("/telemetry", telemetry_1.default);
router.use("/filtermatches", filtermatches_1.default);
router.use("/bestczsk", bestczsk_1.default);
router.use("/rankimage", rankimage_1.default);
router.use("/percentrank", percentrank_1.default);
router.use("/testing", testing_1.default);
router.use("/fame", fame_1.default);
router.use("/vgnews", vgnews_1.default);
router.use("/uuidv4", uuidv4_1.default);
//# sourceMappingURL=index.js.map