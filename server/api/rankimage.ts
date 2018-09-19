import { Router, static as router_static } from "express";
const router: Router = Router();
const path = require("path");

import cacheMW from "./../../functions/cacheMW";

export default router;

router.use(
	"/c",
	router_static(path.join(process.env.PWD, "/static/img/rank/c"))
);

router.get("/c/:mixed_rank", cacheMW(undefined), (req, res) => {
	res.sendFile(
		path.join(
			process.env.PWD,
			`/static/img/rank/c/${req.params.mixed_rank}.png`
		)
	);
});
