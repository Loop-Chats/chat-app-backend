var express = require('express');
const { protectRoute } = require('../middleware/profile.middleware.js');
const { getUserChats, createUserChat } = require('../controllers/chat.controller.js');
var router = express.Router();

router.get('', protectRoute, getUserChats);
router.post('', protectRoute, createUserChat);

module.exports = router;
