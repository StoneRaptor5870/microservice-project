const { promotion, demotion, fetchAllUsers, profileInfo, updateUserDetails, deleteUserById } = require("../database/db");

async function promoteToAdmin(req, res) {
    const { userId } = req.params;

    try {
        await promotion(userId);
        res.status(200).json({ message: "User promoted to admin successfully" });
    } catch (error) {
        console.error("Error promoting user:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

const demoteToUser = async (req, res) => {
    const { userId } = req.params;

    try {
        await demotion(userId);
        res.status(200).json({ message: "User demoted to user successfully" });
    } catch (error) {
        console.error("Error demoting user:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

const getAllUsers = async (req, res) => {
    try {
        users = await fetchAllUsers();
        res.status(200).json({message: "All users", users});
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

const getUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await profileInfo(userId);

        res.status(201).json({
            success: true,
            message: "✅ Profile Details",
            result
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

const updateUserById = async (req, res) => {
    const { userId } = req.params;
    const { name, phone } = req.body;

    try {
        if (!name && !phone) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const result = await updateUserDetails(name, phone, userId);

        res.status(201).json({
            success: true,
            message: "✅ Profile Details Updated Successfully",
            result
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await profileInfo(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isDeleted = await deleteUserById(userId);
        if (!isDeleted) {
            return res.status(500).json({ message: "Failed to delete user." });
        }

        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    promoteToAdmin,
    demoteToUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUser
}