"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const fbattachment_1 = require("./fbattachment");
const botuser_1 = require("./botuser");
const playerdata_1 = require("./playerdata");
const telemetry_1 = require("./telemetry");
const applyfilter_1 = require("./applyfilter");
const bestczsk_1 = require("./bestczsk");
const rankimage_1 = require("./rankimage");
const percentrank_1 = require("./percentrank");
const testing_1 = require("./testing");
const fame_1 = require("./fame");
const vgnews_1 = require("./vgnews");
const uuidv4_1 = require("./uuidv4");
exports.default = router;
router.use("/fbattachment", fbattachment_1.default);
router.use("/botuser", botuser_1.default);
router.use("/playerdata", playerdata_1.default);
router.use("/telemetry", telemetry_1.default);
router.use("/applyfilter", applyfilter_1.default);
router.use("/bestczsk", bestczsk_1.default);
router.use("/rankimage", rankimage_1.default);
router.use("/percentrank", percentrank_1.default);
router.use("/testing", testing_1.default);
router.use("/fame", fame_1.default);
router.use("/vgnews", vgnews_1.default);
router.use("/uuidv4", uuidv4_1.default);
//# sourceMappingURL=index.js.map