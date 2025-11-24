import Chat from "../model/chat.model.js";
import User from "../model/user.model.js";

export const getUserChats = async (req, res) => {
    try {
        const userId = req.user._id;

        const userChats = await Chat.find({ users: userId, latestMessage: {$ne: undefined} }).sort({ updatedAt: -1 }).lean();
        const otherUserIds = userChats.filter(chat => !chat.isGroupChat).map(chat => chat.users.filter(id => id.toString() !== userId.toString())).flat();
        const otherUsers = await User.find({ _id: { $in: otherUserIds } }).select('username').lean();

        const updateUserChats = userChats.map(chat => {
            if (!chat.isGroupChat) {
                const otherUserId = chat.users.find(id => id.toString() !== userId.toString());
                const otherUser = otherUsers.find(user => user._id.toString() === otherUserId.toString()); 
                return {
                    ...chat,
                    chatName: otherUser ? otherUser.username : "Unknown User"
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
        const { otherUserIds, chatName,  } = req.body;
        const isGroupChat = otherUserIds.length > 1;
        const receiver = await User.findById(otherUserIds[0]);

        const newChat = new Chat({
            chatName: isGroupChat ? chatName : receiver.username,
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