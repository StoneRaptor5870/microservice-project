const express = require("express");
const morgan = require("morgan");
const { connectKafka } = require("./utils/kafka");
const { initializeDB } = require("./database/db");
const routes = require('./routes/routes')

const app = express();
app.use(express.json());

app.use(morgan("dev"));

// Initialise services
async function initializeServices() {
    try {
        // Step 1: Initialize database
        console.log("Initializing database...");
        await initializeDB();
        
        // Step 2: Connect to Kafka
        console.log("Connecting to Kafka...");
        await connectKafka();
        
        // Step 3: Start the Express server
        const PORT = process.env.PORT_USER;
        app.listen(PORT, () => {
            console.log(`🚀 User Service running on port ${PORT}`);
        });
        
        return true;
    } catch (error) {
        console.error("❌ Failed to initialize services:", error);
        return false;
    }
}

// API Routes
app.use('/api/v1', routes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Initialise services and handle errors
initializeServices().catch(error => {
    console.error("❌ Fatal error during service initialization:", error);
    process.exit(1);
});

module.exports = app;