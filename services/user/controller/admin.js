const { promotion } = require("../database/db");

async function promoteToAdmin(req, res) {
    const { userId } = req.params;

    try {
        await promotion(userId);
        res.json({ message: "User promoted to admin successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

const demoteToUser = async (req, res) => { }

const getAllUsers = async (req, res) => { }

const getUserById = async (req, res) => { }

const updateUserById = async (req, res) => { }

const deleteUser = async (req, res) => { }

module.exports = {
    promoteToAdmin,
    demoteToUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUser
}