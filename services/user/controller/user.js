const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUser, profileInfo, updateUserDetails, updatePassword } = require("../database/db");
const { publishMessage } = require("../utils/kafka");
const sendEmail = require("../utils/email");

const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password, !phone) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }

        const existingUser = await findUser(email);

        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user in database
        const user = await createUser(name, email, hashedPassword, phone, "user");

        // Publish event to Kafka
        await publishMessage("USER_CREATED", {
            id: user.id,
            name: user.name,
            email: user.email,
            timestamp: new Date().toISOString()
        });

        const token = jwt.sign(
            { email: user.email, id: user.id, role: user.role },
            process.env.JSONSECRET,
            {
                expiresIn: '1h',
            }
        );

        res.status(201).json({
            success: true,
            message: "✅ User registered successfully",
            token
        });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({
            success: false,
            message: "❌ Registration failed",
            error: error.message
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await findUser(email);

        if (!existingUser) {
            return res.status(404).json({ message: "User doesn't exists." });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { email: existingUser.email, id: existingUser.id, role: existingUser.role },
            process.env.JSONSECRET,
            {
                expiresIn: '1h',
            }
        );

        res.status(201).json({
            success: true,
            message: "✅ User logged in successfully",
            token
        });

    } catch (error) {
        console.error("❌ Signin error:", error);
        res.status(500).json({
            success: false,
            message: "❌ Signin failed",
            error: error.message
        });
    }
}

const getUser = async (req, res) => {
    const { id } = req.user;

    try {
        const result = await profileInfo(id);

        res.status(201).json({
            success: true,
            message: "✅ Profile Details",
            result
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const updateUser = async (req, res) => { 
    const { id } = req.user;
    const { name, phone } = req.body;

    try {
        if (!name && !phone) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const result = await updateUserDetails(name, phone, id);

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

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await findUser(email);

        if (!user) {
            return res.status(404).json({ message: "User doesnt exists" });
        }

        const token = jwt.sign(
            { email: user.email, id: user.id, role: user.role },
            process.env.JSONSECRET,
            {
                expiresIn: '1h',
            }
        );

        const resetLink = `http://localhost:3001/reset-password?token=${token}`;

        await sendEmail(
            email,
            "Password Reset Request",
            `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 1 hour.</p>`
        );

        res.json({ message: "Password reset link sent to email" });
    } catch (error) {
        console.error("Error sending reset email:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JSONSECRET);
        const userId = decoded.id;

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const updateQuery = await updatePassword(hashedPassword, userId); 
        
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(400).json({ message: "Invalid or expired token" });
    }
}

const uploadProfilePicture = async (req, res) => { }

module.exports = {
    register,
    login,
    getUser,
    updateUser,
    forgotPassword,
    resetPassword,
    uploadProfilePicture
};