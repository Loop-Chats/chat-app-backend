import User from "../model/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const updateProfile = async (req, res) => {
    try {
        const { username, avatar } = req.body;
        const userId = req.user._id;

        if (!username && !avatar) {
            return res.status(400).json({ message: "At least one field is required to update" });
        }

        const updateFields = {};

        if (username) {
            updateFields.username = username;
        }

        if (avatar) {
            const uploadResponse = await cloudinary.uploader.upload(avatar);
            updateFields.avatar = uploadResponse.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true }
        );

        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("Error in updateProfile controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}