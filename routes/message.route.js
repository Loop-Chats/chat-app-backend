var express = require('express');
const { protectRoute } = require('../middleware/profile.middleware.js');
const { getChatMessages, createChatMessage } = require('../controllers/message.controller.js');
var router = express.Router();

router.get('/chats/:chatId', protectRoute, getChatMessages);
router.post('/chats/:chatId', protectRoute, createChatMessage);


module.exports = router;
