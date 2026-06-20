var express = require('express');
const { protectRoute } = require('../middleware/profile.middleware.js');
const { getUserChats, createUserChat, deleteUserChat, updateGroupDetails, addUserToGroupChat, removeUserFromGroupChat, leaveGroupChat, makeChatAdmin } = require('../controllers/chat.controller.js');
var router = express.Router();

router.get('', protectRoute, getUserChats);
router.post('', protectRoute, createUserChat);
router.delete('/:chatId', protectRoute, deleteUserChat);
router.patch('/:chatId', protectRoute, updateGroupDetails);
router.post('/:chatId/add-user', protectRoute, addUserToGroupChat);
router.patch('/:chatId/remove-user', protectRoute, removeUserFromGroupChat);
router.patch('/:chatId/leave', protectRoute, leaveGroupChat);
router.patch('/:chatId/make-admin', protectRoute, makeChatAdmin);

module.exports = router;
