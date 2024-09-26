import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Helen Connect server is operational');
});

export default router;