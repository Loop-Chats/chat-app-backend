var express = require('express');
const { protectRoute } = require('../middleware/profile.middleware.js');
const { getFriendsForSidebar,sendFriendRequest, respondToFriendRequest, removeFriend, getAllFriendRequests } = require('../controllers/user.controller.js');
const { route } = require('./chat.route.js');
var router = express.Router();

router.get('/friends', protectRoute, getFriendsForSidebar);
router.post('/send-friend-request', protectRoute, sendFriendRequest);
router.patch('/respond-friend-request/:friendRequestId', protectRoute, respondToFriendRequest);
router.patch('/friends/:friendId', protectRoute, removeFriend);
router.get('/friend-requests', protectRoute, getAllFriendRequests);

module.exports = router;
