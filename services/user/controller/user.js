const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUser } = require("../database/db");
const { publishMessage } = require("../utils/kafka");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
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
        const user = await createUser(name, email, hashedPassword);

        // Publish event to Kafka
        await publishMessage("user_registered", {
            id: user.id,
            name: user.name,
            email: user.email,
            timestamp: new Date().toISOString()
        });

        const token = jwt.sign(
            { email: user.email, id: user.id },
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

const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await findUser(email);

        if (!existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { email: existingUser.email, id: existingUser.id },
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

module.exports = { register, signin };