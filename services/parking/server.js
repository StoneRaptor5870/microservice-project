const express = require('express');
const morgan = require("morgan");
const { connectKafka, startKafkaListeners } = require('./utils/kafka');
const { connectDB } = require('./database/db');
const parkingServiceRoutes = require('./routes/routes')

const app = express();
app.use(express.json());

app.use(morgan("dev"));

// Initialise services
async function initializeServices() {
    try {
        // Step 1: Connect to MongoDB
        console.log("Connecting to MongoDB...");
        await connectDB();
        
        // Step 2: Connect to Kafka
        console.log("Connecting to Kafka...");
        await connectKafka();
        
        // Step 3: Subscribe to relevant topics
        console.log("Subscribing to Kafka topics...");
        await startKafkaListeners();
        
        // Step 4: Start the Express server
        const PORT = process.env.PORT_PARKING;
        app.listen(PORT, () => {
            console.log(`🚀 Parking Service running on port ${PORT}`);
        });
        
        return true;
    } catch (error) {
        console.error("❌ Failed to initialize services:", error);
        return false;
    }
}

// API Routes
app.use('/api/v1', parkingServiceRoutes);

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