var express = require('express');
const { register, login, logout, checkAuth } = require('../controllers/auth.controller.js');
const { updateProfile } = require('../controllers/profile.controller.js');
const { protectRoute } = require('../middleware/profile.middleware.js');
var router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.patch('/update-profile', protectRoute, updateProfile);

router.get('/check-auth', protectRoute, checkAuth);

module.exports = router;