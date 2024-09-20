const express = require('express');
const router = express.Router();

const { getReferrals, getReferral, addReferral } = require('../controllers/referrals');

router.get('/:isProcessed', getReferrals);
router.get('/:id', getReferral);
router.post('/', addReferral);

module.exports = router;
