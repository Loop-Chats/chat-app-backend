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