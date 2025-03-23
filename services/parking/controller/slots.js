const { makeSlot, fetchAllSlots, getSlot, modifySlot, removeSlot, getSlotByGarageId } = require("../service/slot");

const createSlot = async (req, res) => {
    const { garageId, slotNumber, status } = req.body;

    try {
        if (!garageId || !slotNumber || !status) {
            return res.status(400).json({ success: false, message: "Missing or invalid required fields" });
        }

        const slotData = {
            garageId,
            slotNumber,
            status
        }

        const newSlot = await makeSlot(slotData);
        return res.status(201).json({ success: true, message: "Slot created successfully", data: newSlot });
    } catch (error) {
        console.error("Error creating slot:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getAllSlots = async (req, res) => {
    const { garageId, status } = req.query;

    try {
        if (!garageId && !status) {
            return res.status(400).json({ success: false, message: "At least one query parameter (garageId or status) is required" });
        }

        const slots = await fetchAllSlots({ garageId, status });

        return res.status(200).json({ success: true, message: "Slots fetched successfully", data: slots });
    } catch (error) {
        console.error("Error fetching all slots:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getSlotsByGarage = async (req, res) => {
    const { garageId } = req.params;

    try {
        const slot = await getSlotByGarageId(garageId);
        if (!slot) return res.status(404).json({ success: false, error: "Slot not found" });
        return res.status(200).json({ success: true, message: "Fetched slot details successfully", data: slot });
    } catch (error) {
        console.error("Error fetching slots by garage:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getSlotById = async (req, res) => {
    const { slotId } = req.params;

    try {
        const slot = await getSlot(slotId);
        if (!slot) return res.status(404).json({ success: false, error: "Slot not found" });
        return res.status(200).json({ success: true, message: "Fetched slot details successfully", data: slot });
    } catch (error) {
        console.error("Error fetching the slot:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const updateSlot = async (req, res) => {
    const { slotId } = req.params;
    const { slotNumber, status } = req.body;

    try {
        if (!slotNumber && !status) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        const updatedSlot = await modifySlot(slotId, req.body);

        if (!updatedSlot) {
            return res.status(404).json({ success: false, message: "Slot not found" });
        }

        return res.status(200).json({ success: true, message: "Garage updated successfully", data: updatedSlot });
    } catch (error) {
        console.error("Error updating the slot:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const deleteSlot = async (req, res) => {
    const { slotId } = req.params;

    try {
        const deletedSlot = await removeSlot(slotId);

        if (!deletedSlot) {
            return res.status(404).json({ success: false, message: "Slot not found" });
        }

        return res.status(200).json({ success: true, message: "Slot deleted successfully" });
    } catch (error) {
        console.error("Error deleting the slot:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = { createSlot, getAllSlots, getSlotsByGarage, getSlotById, updateSlot, deleteSlot };