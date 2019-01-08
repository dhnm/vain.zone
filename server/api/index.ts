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

const gloryStatsKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIyNzgyNDg1MC1mNTNmLTAxMzYtYjc0NS0wYTU4NjQ2MTRkNzMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTQ2OTMwMDMzLCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiJnbG9yeWd1aWRlLXRlc3QiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.fylM4-0DQp_jQ7XfVEBRD8O4v7XnQ57C43jphi94npg";

router.use((req, res, next) => {
    if (res.get("Access-Control-Allow-Origin") /* && req.headers['X-SIGN-ID'] === "Z3dy7U" */) {
        return next();
    } else if (req.get("X-Authorization") === gloryStatsKey) {
        console.log("GloryStats authorized.");
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
