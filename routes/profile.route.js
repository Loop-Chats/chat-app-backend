var express = require('express');
const { protectRoute } = require('../middleware/profile.middleware.js');
const { updateProfile } = require('../controllers/profile.controller.js');
var router = express.Router();


router.patch('', protectRoute, updateProfile);

module.exports = router;