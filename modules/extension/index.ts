import { Router, Request, Response } from "express";
const router = Router();

import messenger from "./messenger";

export default (app: any): Router => {
  router.get("/", (req: Request, res: Response) => {
    app.render(req, res, "/extension/player", {
      error: false,
      extension: true
    });
  });

  router.get("/player/:IGN", (req, res) => {
    app.render(req, res, "/extension/player", {
      IGN: req.params.IGN,
      error: false,
      extension: false
    });
  });

  router.use("/messenger", messenger);

  return router;
};
