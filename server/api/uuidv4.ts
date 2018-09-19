import { Router, Response, Request } from 'express';
const router: Router = Router();

const uuidv4 = require('uuid/v4');

export default router;

router.get(
  '/',
  (req: Request, res: Response): void => {
    const param = parseInt(req.query.n);
    const n =
      typeof param === 'number' &&
      isFinite(param) &&
      Math.floor(param) === param &&
      Math.abs(param) === param
        ? param
        : 1;

    res.json(new Array(...new Array(n)).map(() => uuidv4()));
  },
);
