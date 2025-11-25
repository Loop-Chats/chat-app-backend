import FriendRequest from "../model/friendRequest.model.js";
import User from "../model/user.model.js";

export const getFriendsForSidebar = async (req, res) => {
    try {
        const friendUsers = await User.find({ _id: { $in: req.user.friends } }).select('username avatar');

        if (!friendUsers || friendUsers.length === 0) {
            return res.status(404).json({ message: "No friends found" });
        }

        res.status(200).json(friendUsers);
    } catch (error) {
        console.log("Error in getFriendsForSidebar controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user._id;

        if (senderId.toString() === receiverId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({ message: "Recipient user not found" });
        }

        if (receiver.friends.includes(senderId)) {
            return res.status(400).json({ message: "You are already friends with this user" });
        }

        const existingRequest = await FriendRequest.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ],
            status: "pending"
        });

        if (existingRequest.length > 0) {
            return res.status(400).json({ message: "A pending friend request already exists between you and this user" });
        }

        const friendRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId,
        });

        await friendRequest.save();

        res.status(200).json(friendRequest);
    } catch (error) {
        console.log("Error in sendFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const respondToFriendRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { friendRequestId } = req.params;
        const { action } = req.body;

        const friendRequest = await FriendRequest.findById(friendRequestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if (friendRequest.sender.toString() === userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to respond to this friend request" });
        }

        if (friendRequest.status !== "pending") {
            return res.status(400).json({ message: "This friend request has already been responded to" });
        }

        if (action === "accept") {
            friendRequest.status = "accepted";
            await User.findByIdAndUpdate(friendRequest.sender, { $push: { friends: friendRequest.receiver } });
            await User.findByIdAndUpdate(friendRequest.receiver, { $push: { friends: friendRequest.sender } });
        } else if (action === "reject") {
            friendRequest.status = "rejected";
        }

        await friendRequest.save();

        res.status(200).json(friendRequest.status);
    } catch (error) {
        console.log("Error in respondToFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const removeFriend = async (req, res) => {
    try {
        const userId = req.user._id;
        const { friendId } = req.params;

        if (!req.user.friends.includes(friendId)) {
            return res.status(400).json({ message: "This user is not in your friends list" });
        }

        await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
        await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

        res.status(200).json({ message: "Friend removed successfully" });
    } catch (error) {
        console.log("Error in removeFriend controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getAllFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const friendRequests = await FriendRequest.find({ receiver: userId, status: "pending" }).populate('sender', 'username avatar').sort({ createdAt: -1 }); 

        if (!friendRequests || friendRequests.length === 0) {
            return res.status(404).json({ message: "No friend requests found" });
        }

        res.status(200).json(friendRequests);
    } catch (error) {
        console.log("Error in getAllFriendRequests controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
