import { Router, Request, Response } from "express";
const router: Router = Router();

export default router;

router.get("/:mixed_rank", (req: Request, res: Response): void => {
  res.sendFile(
    `https://vain.zone/static/img/rank/c/${req.params.mixed_rank}.png`
  );
});
