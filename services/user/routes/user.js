const { Router } = require('express');
const { register, signin } = require('../controller/user')

const router = Router();

router.post('/signin', signin);
router.post('/register', register);

module.exports = router;