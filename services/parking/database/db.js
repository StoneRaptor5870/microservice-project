const mongoose = require("mongoose");

const connectDB = async (retries = 5, delay = 3000) => {
    const uri = process.env.MONGODB_URI;
    
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempting to connect to MongoDB (attempt ${i + 1}/${retries})...`);
            
            await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
            });
            
            console.log("✅ MongoDB connected successfully");
            return true;
        } catch (error) {
            console.error(`❌ MongoDB connection failed (attempt ${i + 1}/${retries}):`, error);
            
            if (i < retries - 1) {
                console.log(`Waiting ${delay}ms before retrying...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error("❌ All MongoDB connection attempts failed");
                throw error;
            }
        }
    }
    return false;
};

const ParkingSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    slotId: { type: Number, required: true },
    status: { 
        type: String, 
        required: true,
        enum: ['reserved', 'occupied', 'available', 'maintenance']
    },
    assignedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ParkingSchema.index({ slotId: 1, status: 1 });

const Parking = mongoose.model("Parking", ParkingSchema);

module.exports = { connectDB, Parking };