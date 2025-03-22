const { Garage } = require('../database/db');

const addGarage = async (garageData) => {
    try {
        const garage = new Garage(garageData);
        return await garage.save();
    } catch (error) {
        throw new Error("Failed to create garage: " + error.message);
    }
};

const fetchAllGarages = async () => {
    try {
        return await Garage.find();
    } catch (error) {
        throw new Error("Failed to fetch garages: " + error.message);
    }
}

const fetchGarageById = async (garageId) => {
    try {
        return await Garage.findById(garageId);
    } catch (error) {
        throw new Error("Failed to fetch garage: " + error.message);
    }
}

const modifyGarage = async (garageId, updateData) => {
    try {
        return await Garage.findByIdAndUpdate(garageId, updateData, { new: true, runValidators: true });
    } catch (error) {
        throw new Error("Failed to update garage: " + error.message);
    }
}

const removeGarage = async (garageId) => {
    try {
        return await Garage.findByIdAndDelete(garageId);
    } catch (error) {
        throw new Error("Failed to delete garage: " + error.message);
    }
}

const findGaragesByLocation = async (latitude, longitude, radius) => {
    try {
        return await Garage.find({
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radius * 1000 // km to m
                }
            }
        });
    } catch (error) {
        throw new Error("Failed to search garages: " + error.message);
    }
};

const getAvailableSlots = async (garageId) => {
    const garage = await Garage.findById(garageId, "availableSlots");

    if (!garage) return null;

    return garage.availableSlots;
};

module.exports = { addGarage, fetchAllGarages, fetchGarageById, modifyGarage, removeGarage, findGaragesByLocation, getAvailableSlots }