"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const fbattachment_1 = require("./fbattachment");
const botuser_1 = require("./botuser");
const matches_1 = require("./matches");
const telemetry_1 = require("./telemetry");
const applyfilter_1 = require("./applyfilter");
exports.default = router;
router.use('/fbattachment', fbattachment_1.default);
router.use('/botuser', botuser_1.default);
router.use('/matches', matches_1.default);
router.use('/telemetry', telemetry_1.default);
router.use('/applyfilter', applyfilter_1.default);
//# sourceMappingURL=index.js.map