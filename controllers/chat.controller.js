import Chat from "../model/chat.model.js";
import User from "../model/user.model.js";

export const getUserChats = async (req, res) => {
    try {
        const userId = req.user._id;

        const userChats = await Chat.find({ users: userId, latestMessage: {$ne: undefined} }).sort({ updatedAt: -1 }).lean();
        const otherUserIds = userChats.filter(chat => !chat.isGroupChat).map(chat => chat.users.filter(id => id.toString() !== userId.toString())).flat();
        const otherUsers = await User.find({ _id: { $in: otherUserIds } }).select('username avatar').lean();

        const updateUserChats = userChats.map(chat => {
            if (!chat.isGroupChat) {
                const otherUserId = chat.users.find(id => id.toString() !== userId.toString());
                const otherUser = otherUsers.find(user => user._id.toString() === otherUserId.toString()); 
                return {
                    ...chat,
                    chatName: otherUser ? otherUser.username : "Unknown User",
                    chatImage: otherUser ? otherUser.avatar : ""
                }
            }
            return chat;
        });

        res.status(200).json(updateUserChats);
    } catch (error) {
        console.log("Error in getUserChats controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const createUserChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otherUserIds, chatName, chatImage } = req.body;
        const isGroupChat = otherUserIds.length > 1;
        const chatExists = await Chat.findOne({
            isGroupChat: false,
            users: { $all: [userId, ...otherUserIds], $size: 2 }
        });

        if(chatExists && !isGroupChat) {
            return res.status(400).json({message: "Chat between these users already exists"});
        }

        if (isGroupChat && (!chatName || chatName.trim() === "")) {
            return res.status(400).json({ message: "Group chat name is required" });
        }

        if (isGroupChat && (!chatImage || chatImage.trim() === "")) {
            return res.status(400).json({ message: "Group chat image is required" });
        }

        if (chatImage) {
            const uploadResponse = await cloudinary.uploader.upload(chatImage);
            imageUrl = uploadResponse.secure_url;
        }

        const newChat = new Chat({
            chatName: isGroupChat ? chatName : "",
            chatImage: isGroupChat ? imageUrl : "",
            isGroupChat,
            users: [userId, ...otherUserIds],
            groupAdmin: userId,
        });

        const savedChat = await newChat.save();
        res.status(201).json(savedChat);
    } catch (error) {
        console.log("Error in createUserChat controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const deleteUserChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({ message: "Cannot delete a non-group chat" });
        }

        if (!chat.users.includes(userId) || userId.toString() !== chat.groupAdmin.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this chat" });
        }

        await Chat.findByIdAndDelete(chatId);

        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
        console.log("Error in deleteUserChat controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const renameGroupChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;
        const { newChatName } = req.body;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({ message: "Cannot rename a non-group chat" });
        }

        if (!newChatName || newChatName.trim() === "") {
            return res.status(400).json({ message: "New chat name is required" });
        }

        if (userId.toString() !== chat.groupAdmin.toString()) {
            return res.status(403).json({ message: "Only group admin can rename the chat" });
        }

        chat.chatName = newChatName;
        await chat.save();
    } catch (error) {
        console.log("Error in renameGroupChat controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const addUserToGroupChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;
        const { newUserId } = req.body;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({ message: "Cannot add users to a non-group chat" });
        }

        if (userId.toString() !== chat.groupAdmin.toString()) {
            return res.status(403).json({ message: "Only group admin can add users to the chat" });
        }

        if (chat.users.includes(newUserId)) {
            return res.status(400).json({ message: "User is already in the chat" });
        }

        chat.users.push(newUserId);
        await chat.save();
    } catch (error) {
        console.log("Error in addUserToGroupChat controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const removeUserFromGroupChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;
        const { removeUserId } = req.body;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({ message: "Cannot remove users from a non-group chat" });
        }

        if (userId.toString() !== chat.groupAdmin.toString()) {
            return res.status(403).json({ message: "Only group admin can remove users from the chat" });
        }

        if (!chat.users.includes(removeUserId)) {
            return res.status(400).json({ message: "User is not in the chat" });
        }

        if (removeUserId.toString() === chat.groupAdmin.toString()) {
            return res.status(400).json({ message: "Group admin cannot be removed from the chat" });
        }

        chat.users = chat.users.filter(id => id.toString() !== removeUserId.toString());
        await chat.save();
    } catch (error) {
        console.log("Error in removeUserFromGroupChat controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const leaveGroupChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({ message: "Cannot leave a non-group chat" });
        }

        if (!chat.users.includes(userId)) {
            return res.status(400).json({ message: "You are not a member of this chat" });
        }

        chat.users = chat.users.filter(id => id.toString() !== userId.toString());
        await chat.save();
    } catch (error) {
        console.log("Error in leaveGroupChat controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}