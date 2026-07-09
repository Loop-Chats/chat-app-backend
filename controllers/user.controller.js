import FriendRequest from "../model/friendRequest.model.js";
import User from "../model/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getFriendsForSidebar = async (req, res) => {
  try {
    const friendUsers = await User.find({
      _id: { $in: req.user.friends },
    }).select("username avatar");

    res.status(200).json(friendUsers);
  } catch (error) {
    console.log("Error in getFriendsForSidebar controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { username } = req.body;
    const senderId = req.user._id;

    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const receiver = await User.findOne({ username });

    if (!receiver) {
      return res
        .status(404)
        .json({ message: "User not found. Check the spelling and try again." });
    }

    const receiverId = receiver._id;

    if (senderId.toString() === receiverId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself." });
    }

    if (sender.friends.includes(receiverId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user." });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message:
          "A pending friend request already exists between you and this user.",
      });
    }

    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    await friendRequest.save();

    const populatedRequest = await FriendRequest.findById(friendRequest._id)
      .populate("sender", "username avatar email");

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newFriendRequest", populatedRequest);
    }

    res.status(201).json({ friendRequest: populatedRequest });
  } catch (error) {
    console.log("Error in sendFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const respondToFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendRequestId } = req.params;
    const { action } = req.body;

    const friendRequest = await FriendRequest.findById(friendRequestId)
      .populate("sender", "username avatar email");

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to respond to this friend request",
      });
    }

    if (friendRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This friend request has already been responded to" });
    }

    if (action === "accept") {
      friendRequest.status = "accepted";
      await User.findByIdAndUpdate(friendRequest.sender, {
        $push: { friends: friendRequest.receiver },
      });
      await User.findByIdAndUpdate(friendRequest.receiver, {
        $push: { friends: friendRequest.sender },
      });

      const senderSocketId = getReceiverSocketId(friendRequest.sender._id.toString());
      if (senderSocketId) {
        const currentUser = await User.findById(userId).select("username avatar email");

        io.to(senderSocketId).emit("friendRequestAccepted", currentUser);
      }
    } else if (action === "reject") {
      friendRequest.status = "rejected";
    }

    await friendRequest.save();

    res.status(200).json(friendRequest.status);
  } catch (error) {
    console.log("Error in respondToFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.params;

    if (!req.user.friends.includes(friendId)) {
      return res
        .status(400)
        .json({ message: "This user is not in your friends list" });
    }

    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    io.to(friendId.toString()).emit("friendRemoved", userId);

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.log("Error in removeFriend controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const friendRequests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(friendRequests);
  } catch (error) {
    console.log("Error in getAllFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
