import { Router } from "express";
const router: Router = Router();

import fbattachment from "./fbattachment";
import botuser from "./botuser";
import playerdata from "./playerdata";
import telemetry from "./telemetry";
import applyfilter from "./applyfilter";
import bestczsk from "./bestczsk";
import rankimage from "./rankimage";
import percentrank from "./percentrank";
import testing from "./testing";
import fame from "./fame";
import vgnews from "./vgnews";

import uuidv4 from "./uuidv4";

export default router;

router.use("/fbattachment", fbattachment);
router.use("/botuser", botuser);
router.use("/playerdata", playerdata);
router.use("/telemetry", telemetry);
router.use("/applyfilter", applyfilter);
router.use("/bestczsk", bestczsk);
router.use("/rankimage", rankimage);
router.use("/percentrank", percentrank);
router.use("/testing", testing);
router.use("/fame", fame);
router.use("/vgnews", vgnews);

router.use("/uuidv4", uuidv4);