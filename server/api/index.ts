import { Router } from "express";
const router: Router = Router();

import fbattachment from "./fbattachment";
import botuser from "./botuser";
import playerdata from "./playerdata";
import telemetry from "./telemetry";
import filtermatches from "./filtermatches";
import bestczsk from "./bestczsk";
import rankimage from "./rankimage";
import percentrank from "./percentrank";
import testing from "./testing";
import fame from "./fame";
import vgnews from "./vgnews";

import uuidv4 from "./uuidv4";

export default router;

import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();

router.use((req: any, res, next) => {
  if (req.get("X-Authorization") === serverRuntimeConfig.gloryStatsKey) {
    console.log("GloryStats authorized.");
    console.log(req.headers);
    req.gloryStatsKey = serverRuntimeConfig.gloryStatsKey;
    return next();
  } else if (
    true || res.get(
      "Access-Control-Allow-Origin"
    ) /* && req.headers['X-SIGN-ID'] === "Z3dy7U" */
  ) {
    return next();
  }

  res.status(403).end();
  return;
});

router.use("/fbattachment", fbattachment);
router.use("/botuser", botuser);
router.use("/playerdata", playerdata);
router.use("/telemetry", telemetry);
router.use("/filtermatches", filtermatches);
router.use("/bestczsk", bestczsk);
router.use("/rankimage", rankimage);
router.use("/percentrank", percentrank);
router.use("/testing", testing);
router.use("/fame", fame);
router.use("/vgnews", vgnews);

router.use("/uuidv4", uuidv4);
