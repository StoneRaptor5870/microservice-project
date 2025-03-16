const { createUser } = require("../db");
const { publishMessage } = require("../kafka");

const register = async (req, res) => {
    try {
        const { name, email } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ 
                success: false, 
                message: "Name and email are required" 
            });
        }
        
        // Create user in database
        const user = await createUser(name, email);
        
        // Publish event to Kafka
        await publishMessage("user_registered", {
            id: user.id,
            name: user.name,
            email: user.email,
            timestamp: new Date().toISOString()
        });
        
        res.status(201).json({ 
            success: true, 
            message: "✅ User registered successfully", 
            user 
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

module.exports = { register };