import User from "../model/user.model.js";

export const updateProfile = async (req, res) => {
    try {
        const { username, avatar } = req.body;
        const userId = req.user._id;
        var updatedUser = null;

        if (!username && !avatar) {
            return res.status(400).json({ message: "At least one field is required to update" });
        }

        if (avatar) {
            const uploadResponse = await cloudinary.uploader.upload(avatar);
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: {avatar: uploadResponse.secure_url }},
                { new: true }
            );
        }

        if (username) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: {username: username } },
                { new: true }
            );
        }

        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}