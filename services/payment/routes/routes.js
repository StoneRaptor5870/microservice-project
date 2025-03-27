const { Router } = require('express');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = Router();

module.exports = router;