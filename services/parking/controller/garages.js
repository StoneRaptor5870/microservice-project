const { addGarage, fetchAllGarages, fetchGarageById, modifyGarage, removeGarage, findGaragesByLocation, getAvailableSlots } = require('../service/garages');

const createGarage = async (req, res) => {
    const { name, location, totalSlots, availableSlots, slotTypes, pricePerHour } = req.body;

    try {
        if (
            !name ||
            !location?.coordinates ||
            !Array.isArray(location.coordinates) ||
            location.coordinates.length !== 2 ||
            !(typeof location.coordinates[0] === "number" && typeof location.coordinates[1] === "number") ||
            !totalSlots ||
            !availableSlots ||
            !pricePerHour
        ) {
            return res.status(400).json({ success: false, message: "Missing or invalid required fields" });
        }

        const garageData = {
            name,
            location: {
                type: "Point",
                coordinates: location.coordinates
            },
            totalSlots,
            availableSlots,
            slotTypes,
            pricePerHour
        };

        const newGarage = await addGarage(garageData);
        res.status(201).json({ success: true, message: "Garage created successfully", data: newGarage });
    } catch (error) {
        console.error("Error creating garage:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getAllGarages = async (req, res) => {
    try {
        const garages = await fetchAllGarages();
        res.status(200).json({ success: true, data: garages });
    } catch (error) {
        console.error("Error fetching garages:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getGarage = async (req, res) => {
    const { garageId } = req.params;

    try {
        const garage = await fetchGarageById(garageId);

        if (!garage) {
            return res.status(404).json({ success: false, message: "Garage not found" });
        }

        res.status(200).json({ success: true, data: garage });
    } catch (error) {
        console.error("Error fetching the garage:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const updateGarage = async (req, res) => {
    const { garageId } = req.params;
    const { name, location, totalSlots, availableSlots, slotTypes, pricePerHour } = req.body;

    try {
        if (!name && !location && !totalSlots && !availableSlots && !slotTypes && !pricePerHour) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        const updatedGarage = await modifyGarage(garageId, req.body);

        if (!updatedGarage) {
            return res.status(404).json({ success: false, message: "Garage not found" });
        }

        res.status(200).json({ success: true, message: "Garage updated successfully", data: updatedGarage });
    } catch (error) {
        console.error("Error updating the garage:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const deleteGarage = async (req, res) => {
    const { garageId } = req.params;

    try {
        const deletedGarage = await removeGarage(garageId);

        if (!deletedGarage) {
            return res.status(404).json({ success: false, message: "Garage not found" });
        }

        res.status(200).json({ success: true, message: "Garage deleted successfully" });
    } catch (error) {
        console.error("Error deleting the garage:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const searchGaragesByLocation = async (req, res) => {
    const { latitude, longitude, radius = 5 } = req.query;

    try {
        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
        }

        const garages = await findGaragesByLocation(parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
        res.status(200).json({ success: true, data: garages });
    } catch (error) {
        console.error("Error searching the garages:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getAvailableSlotsByGarage = async (req, res) => {
    const { garageId } = req.params;

    try {
        const availableSlots = await getAvailableSlots(garageId);

        if (availableSlots === null) {
            return res.status(404).json({ message: "Garage not found" });
        }

        res.status(200).json({ availableSlots });
    } catch (error) {
        console.error("Error fetching the available slots:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = { createGarage, getAllGarages, getGarage, updateGarage, deleteGarage, getAvailableSlotsByGarage, searchGaragesByLocation };