const { Slot } = require("../database/db")

const makeSlot = async (slotData) => {
    try {
        const slot = new Slot(slotData);
        return await slot.save();
    } catch (error) {
        throw new Error("Failed to create slot: " + error.message);
    }
}

const fetchAllSlots = async (query) => {
    try {
        const filter = {};
        if (query.garageId) filter.garageId = query.garageId;
        if (query.status) filter.status = query.status;
        return await Slot.find(filter);
    } catch (error) {
        throw new Error("Failed to fetch all slots: " + error.message);
    }
}

const getSlotByGarageId = async (garageId) => {
    try {
        return await Slot.find({ garageId });
    } catch (error) {
        throw new Error("Failed to fetch slot by garage: " + error.message);
    }
}

const getSlot = async (slotId) => {
    try {
        return await Slot.findById(slotId);
    } catch (error) {
        throw new Error("Failed to fetch the slot: " + error.message);
    }
}

const modifySlot = async (slotId, updateData) => {
    try {
        return await Slot.findByIdAndUpdate(slotId, updateData, { new: true, runValidators: true });
    } catch (error) {
        throw new Error("Failed to update slot: " + error.message);
    }
}
const removeSlot = async (slotId) => {
    try {
        return await Slot.findByIdAndDelete(slotId);
    } catch (error) {
        throw new Error("Failed to delete slot: " + error.message);
    }
}

module.exports = { makeSlot, fetchAllSlots, getSlotByGarageId, getSlot, modifySlot, removeSlot };