var express = require('express');
const { protectRoute } = require('../middleware/profile.middleware.js');
const { getFriendsForSidebar } = require('../controllers/user.controller.js');
var router = express.Router();

router.get('/friends', protectRoute, getFriendsForSidebar);

module.exports = router;
