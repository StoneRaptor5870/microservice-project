const { User, Vehicle } = require("../database/db");

// Kafka message handlers
async function handleUserRegistered(message) {
    try {
        console.log(`New user registered: ${message.name} (ID: ${message.id})`);

        const existingUser = await User.findOne({ userId: message.id });

        if (!existingUser) {
            await User.create({
                userId: message.id,
                name: message.name,
                email: message.email,
            });

            console.log(`✅ User ${message.id} stored in MongoDB.`);
        } else {
            console.log(`⚠️ User ${message.id} already exists in MongoDB.`);
        }
    } catch (error) {
        console.error("❌ Error handling USER_CREATED:", error);
    }
}

async function handleVehicleRegistered(message) {
    try {
        console.log(`New vehicle added: ${message.vehicleType} (ID: ${message.id}) for user ${message.userId}`);

        const existingVehicle = await Vehicle.findOne({ vehicleId: message.id });

        if (!existingVehicle) {
            await Vehicle.create({
                vehicleId: message.id,
                userId: message.userId,
                vehicleType: message.vehicleType,
            });

            console.log(`✅ Vehicle ${message.id} stored in MongoDB.`);
        } else {
            console.log(`⚠️ Vehicle ${message.id} already exists in MongoDB.`);
        }
    } catch (error) {
        console.error("❌ Error handling VEHICLE_CREATED:", error);
    }
}

module.exports = { handleUserRegistered, handleVehicleRegistered };