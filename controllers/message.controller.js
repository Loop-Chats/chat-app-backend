import Chat from "../model/chat.model.js";
import Message from "../model/message.model.js";

export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        const chatMessages = await Message.find({ chat: chatId }).sort({ createdAt: -1 });

        res.status(200).json(chatMessages);
    } catch (error) {
        console.log("Error in getChatMessages controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const createChatMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { text, image } = req.body;
        const senderId = req.user._id;
        let imageUrl;

        if (chatId == null) {
            return res.status(400).json({ message: "Chat ID is required" });
        }

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            text,
            image: imageUrl,
            chat: chatId,
            readBy: [],
        });

        await newMessage.save();

        await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in createChatMessage controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const editMessage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { messageId, newText } = req.body;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only edit your own messages" });
        }

        if (!newText || newText.trim() === "") {
            return res.status(400).json({ message: "New message text is required" });
        }

        if (message.image) {
            return res.status(400).json({ message: "Cannot edit messages with images" });
        }

        message.text = newText;
        await message.save();

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in editChatMessage controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { messageId } = req.body;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        await Message.findByIdAndDelete(messageId);
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.log("Error in deleteMessage controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const markMessageAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const { messageId } = req.params;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (!message.readBy.includes(userId) && message.senderId.toString() !== userId.toString()) {
            message.readBy.push(userId);
            await message.save();
        }

        res.status(200).json({ message: "Message marked as read" });
    } catch (error) {
        console.log("Error in markMessageAsRead controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}