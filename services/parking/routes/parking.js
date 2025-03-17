const { Router } = require('express');
const { reserveSlot } = require('../controller/parking')
const authenticateToken = require('../middleware/auth');

const router = Router();

router.post('/reserve-slot', authenticateToken, reserveSlot);

module.exports = router;