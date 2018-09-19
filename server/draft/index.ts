import { Router, Request, Response } from 'express';
const router = Router();

export default (nextApp: any): Router => {
  router.get('/', (req, res) => {
    nextApp.render(req, res, '/draft', {
      urlPath: req.protocol + '://' + req.headers.host,
    });
  });

  router.get('/:roomID', (req: Request, res: Response) => {
    nextApp.render(req, res, '/draft', {
      urlPath: req.protocol + '://' + req.headers.host,
      roomID: decodeURIComponent(req.params.roomID),
    });
  });

  router.get('/:roomID/:teamID', (req: Request, res: Response) => {
    nextApp.render(req, res, '/draft', {
      urlPath: req.protocol + '://' + req.headers.host,
      roomID: decodeURIComponent(req.params.roomID),
      teamID: req.params.teamID,
    });
  });

  return router;
};
