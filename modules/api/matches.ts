import { Router, Response, Request } from "express";
const router: Router = Router();

import getData from "./../functions/getData";

export default router;

router.get("/", (req: Request, res: Response): void => {
  getData(req.query.IGN)
    .then((data: any): void => {
      res.writeHead(200, {
        "Content-Type": "application/json"
      });
      res.write(JSON.stringify(data));
      res.end();
    })
    .catch(error => {
      res.writeHead(200, {
        // 200 to handle error myself, otherwise it renders 404 page
        "Content-Type": "application/json"
      });
      res.write(
        JSON.stringify({
          error: true,
          errorMessage: error
        })
      );
      res.end();
    });
});
