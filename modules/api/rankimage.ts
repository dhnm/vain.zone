import { Router, Request, Response, static as router_static } from "express";
const router: Router = Router();
const path = require("path");

export default router;

router.use(
	"/c",
	router_static(path.join(process.env.PWD, "/static/img/rank/c"))
);

router.get("/c/:mixed_rank", (req: Request, res: Response): void => {
	res.sendFile(
		path.join(
			process.env.PWD,
			`/static/img/rank/c/${req.params.mixed_rank}.png`
		)
	);
});
