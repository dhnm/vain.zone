import { Router } from 'express';
const router: Router = Router();

import fbattachment from './fbattachment';
import botuser from './botuser';
import matches from './matches';
import telemetry from './telemetry';
import applyfilter from './applyfilter';

export default router;

router.use('/fbattachment', fbattachment);
router.use('/botuser', botuser);
router.use('/matches', matches);
router.use('/telemetry', telemetry);
router.use('/applyfilter', applyfilter);
