const express = require("express");
const router = express.Router();

const uploadToFb = require("./fbattachment");
const getBotUser = require("./botuser");
const getMatches = require("./matches");
const telemetry = require("./telemetry");

module.exports = router;

router.use("/fbattachment", uploadToFb);
router.use("/botuser", getBotUser);
router.use("/matches", getMatches);
router.use("/telemetry", telemetry);
