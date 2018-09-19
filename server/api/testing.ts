import { Router } from "express";
const router: Router = Router();

export default router;

router.get("/", (_, res): void => {
	res.json({ ping: "pong" });
});
