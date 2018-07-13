import { Router, static as router_static } from 'express';
const path = require('path');
const router: Router = Router();

import fbattachment from './fbattachment';
import botuser from './botuser';
import matches from './matches';
import telemetry from './telemetry';
import applyfilter from './applyfilter';
import bestczsk from './bestczsk';
import testing from './testing';

import uuidv4 from './uuidv4';

export default router;

router.use('/fbattachment', fbattachment);
router.use('/botuser', botuser);
router.use('/matches', matches);
router.use('/telemetry', telemetry);
router.use('/applyfilter', applyfilter);
router.use('/bestczsk', bestczsk);
router.use(
  '/rankimage/c',
  router_static(path.join(process.env.PWD, '/static/img/rank/c')),
);
router.get('/rankimage/c/:mixed_rank', (req, res) => {
  res.sendFile(
    path.join(
      process.env.PWD,
      `/static/img/rank/c/${req.params.mixed_rank}.png`,
    ),
  );
});
console.log(
  'keylog',
  process.env.PWD,
  process.cwd(),
  path.join(process.env.PWD, '/static/img/rank/c'),
  path.normalize(path.join(process.env.PWD, '/static/img/rank/c')),
);
router.use('/testing', testing);

router.use('/uuidv4', uuidv4);
