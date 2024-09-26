import express from 'express';
const router = express.Router();

import { getReferrals, getReferral, addReferral } from '../controllers/referrals.js';

router.get('/:isProcessed', getReferrals);
router.get('/:id', getReferral);
router.post('/', addReferral);

export default router;
