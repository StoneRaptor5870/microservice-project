const { publishMessage } = require("../utils/kafka");
const { removeUserVehicle, profileInfo, addUserVehicle, userVehicles, userVehicle, updateUserVehicle } = require("../database/db");

const addVehicle = async (req, res) => {
    const { userId } = req.params;
    const { licencePlate, make, model, colour, type } = req.body;

    try {
        const user = await profileInfo(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const vehicle = await addUserVehicle(userId, licencePlate, make, model, colour, type);

        await publishMessage("VEHICLE_CREATED", {
            id: vehicle.id,
            userId: vehicle.user_id,
            vehicleType: vehicle.type,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: "Vehicle added successfully.",
            vehicle
        });
    } catch (error) {
        console.error("Error adding vehicle:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

const getUserVehicles = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await profileInfo(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const result = await userVehicles(userId);

        if (!result) {
            return res.status(404).json({ message: "Vehicles not found or unauthorized to show." });
        }

        res.status(200).json({
            success: true,
            vehicles: result
        });
    } catch (error) {
        console.error("Error fetching user vehicles:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

const getVehicleById = async (req, res) => {
    const { userId, vehicleId } = req.params;

    try {
        const user = await profileInfo(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const result = await userVehicle(userId, vehicleId);

        if (!result) {
            return res.status(404).json({ message: "Vehicle not found or unauthorized to show." });
        }

        res.status(200).json({
            success: true,
            vehicle: result
        });
    } catch (error) {
        console.error("Error fetching user vehicle:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

const updateVehicle = async (req, res) => {
    const { userId, vehicleId } = req.params;
    const { licencePlate, make, model, colour } = req.body;

    try {
        if (!licencePlate && !make && !model && !colour) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const user = await profileInfo(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const updatedVehicle = await updateUserVehicle(licencePlate, make, model, colour, vehicleId, userId);

        if (!updatedVehicle) {
            return res.status(404).json({ message: "Vehicle not found or unauthorized to update." });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully.",
            vehicle: updatedVehicle
        });
    } catch (error) {
        console.error("Error updating user vehicle details:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

const removeVehicle = async (req, res) => {
    const { userId, vehicleId } = req.params;

    try {
        const result = await removeUserVehicle(vehicleId, userId);

        if (!result) {
            return res.status(404).json({ message: "Vehicle not found or unauthorized to update." });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    addVehicle,
    getUserVehicles,
    removeVehicle,
    getVehicleById,
    updateVehicle
};