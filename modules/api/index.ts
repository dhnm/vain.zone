import { Router, static as router_static } from "express";
const path = require("path");
const router: Router = Router();

import fbattachment from "./fbattachment";
import botuser from "./botuser";
import matches from "./matches";
import telemetry from "./telemetry";
import applyfilter from "./applyfilter";
import bestczsk from "./bestczsk";
import testing from "./testing";

import uuidv4 from "./uuidv4";

export default router;

router.use("/fbattachment", fbattachment);
router.use("/botuser", botuser);
router.use("/matches", matches);
router.use("/telemetry", telemetry);
router.use("/applyfilter", applyfilter);
router.use("/bestczsk", bestczsk);
router.use(
	"/rankimage/c",
	router_static(path.join(__dirname, "../../static/img/rank/c"))
);
console.log("keylog", path.join(__dirname, "../../static/img/rank/c"));
router.use("/testing", testing);

router.use("/uuidv4", uuidv4);
