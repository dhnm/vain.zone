import { Router, Response, Request } from "express";
const router: Router = Router();

import getData from "./../functions/getData";

export default router;

router.get("/", (req: Request, res: Response): void => {
  getData(req.query.IGN)
    .then((data: any): void => {
      res.json(data);
    })
    .catch(error => {
      res.json({
        error: true,
        errorMessage: error
      });
    });
});
