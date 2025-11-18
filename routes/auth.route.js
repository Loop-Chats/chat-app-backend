var express = require('express');
const { register } = require('../controllers/auth.controller');
var router = express.Router();

router.post('/register', register);

module.exports = router;