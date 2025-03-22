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
    garageId: { type: mongoose.Schema.Types.ObjectId, ref: "Garage", required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
    vehicleId: { type: Number, required: true },
    startTime: { type: Date, default: Date.now, required: true },
    endTime: { type: Date },
    status: { 
        type: String, 
        enum: ["active", "completed", "cancelled"], 
        default: "active", 
        required: true 
    },
    updatedAt: { type: Date, default: Date.now },
    pricePerHour: { type: Number, required: true },
    totalCharge: { type: Number },
    valetAssigned: { type: Number},
}, { timestamps: true });

const GarageSchema = new mongoose.Schema({
    name: {type: String, required: true},
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    totalSlots: { type: Number, required: true },
    availableSlots: { type: Number, required: true },
    slotTypes: [{ type: String, enum: ['compact', 'SUV', 'EV', 'bike', 'handicap'] }],
    pricePerHour: { type: Number, required: true }
});

const SlotSchema = new mongoose.Schema({
    garageId: { type: mongoose.Schema.Types.ObjectId, ref: "Garage", required: true },
    slotNumber: { type: Number, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ["available", "reserved", "occupied", "maintenance"]
    }
});

GarageSchema.index({ location: "2dsphere" });

ParkingSchema.index({ userId: 1, vehicleId: 1 });
ParkingSchema.index({ slotId: 1, status: 1 });

const Parking = mongoose.model("Parking", ParkingSchema);
const Garage = mongoose.model("Garage", GarageSchema);
const Slot = mongoose.model("Slot", SlotSchema);

module.exports = { connectDB, Parking, Garage, Slot };