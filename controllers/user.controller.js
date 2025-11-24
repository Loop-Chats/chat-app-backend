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