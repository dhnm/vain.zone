import { Router } from "express";
const router: Router = Router();

import fbattachment from "./fbattachment";
import botuser from "./botuser";
import matches from "./matches";
import telemetry from "./telemetry";
import applyfilter from "./applyfilter";
import bestczsk from "./bestczsk";
import rankimage from "./rankimage";
import percentrank from "./percentrank";
import testing from "./testing";

import uuidv4 from "./uuidv4";

export default router;

router.use("/fbattachment", fbattachment);
router.use("/botuser", botuser);
router.use("/matches", matches);
router.use("/telemetry", telemetry);
router.use("/applyfilter", applyfilter);
router.use("/bestczsk", bestczsk);
router.use("/rankimage", rankimage);
router.use("/percentrank", percentrank);
router.use("/testing", testing);

router.use("/uuidv4", uuidv4);
