const { Router } = require('express');
const { reserveSlot } = require('../controller/parking')

const router = Router();

router.post('/reserve-slot', reserveSlot);

module.exports = router;