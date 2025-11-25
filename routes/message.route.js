var express = require('express');
const { protectRoute } = require('../middleware/profile.middleware.js');
const { getChatMessages, createChatMessage, editMessage, deleteMessage, markMessageAsRead } = require('../controllers/message.controller.js');
var router = express.Router();

router.get('/chats/:chatId', protectRoute, getChatMessages);
router.post('/chats/:chatId', protectRoute, createChatMessage);
router.patch('', protectRoute, editMessage);
router.delete('', protectRoute, deleteMessage);
router.patch('/mark-message/:messageId', protectRoute, markMessageAsRead);

module.exports = router;
