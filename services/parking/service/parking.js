const mongoose = require('mongoose');
const { Slot, Parking, Garage } = require('../database/db');

function calculateTotalCharge(startTime, endTime, pricePerHour) {
    const durationHours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
    return durationHours * pricePerHour;
}

const createReservation = async (reservationData) => {
    const { 
        userId, 
        vehicleId, 
        garageId, 
        slotId, 
        pricePerHour, 
        endTime 
    } = reservationData;

    try {
        const slot = await Slot.findOneAndUpdate(
            { 
                _id: slotId, 
                status: { $in: ['available'] } 
            },
            { 
                status: 'reserved',
            },
            { 
                new: true,
                runValidators: true 
            }
        );

        if (!slot) {
            throw new Error('Slot is already reserved or cannot be reserved');
        }

        const startTime = new Date();
        const totalCharge = calculateTotalCharge(startTime, new Date(endTime), pricePerHour);

        const newReservation = new Parking({
            userId,
            vehicleId,
            garageId,
            slotId,
            startTime,
            endTime: new Date(endTime),
            pricePerHour,
            totalCharge,
            status: 'active'
        });

        await newReservation.save();

        return newReservation;
    } catch (error) {
        throw error;
    }
};

const listAllReservations = async (filters = {}) => {
    const { userId, status } = filters;
    
    const query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    return await Parking.find(query)
        .populate('user', 'name email')
        .populate('vehicle', 'vehicleType')
        .sort({ createdAt: -1 });
}

const getUserReservations = async (userId) => {
    return await Parking.find({ userId })
        .populate('user', 'name email')
        .populate('vehicle', 'vehicleType')
        .sort({ createdAt: -1 });
};

const getReservation = async (reservationId) => {
    const reservation = await Parking.findById(reservationId)
        .populate('user', 'name email')
        .populate('vehicle', 'vehicleType');
    
    if (!reservation) {
        throw new Error('Reservation not found');
    }
    
    return reservation;
}

const updateReservation = async (reservationId, updateData) => {
    try {
        const existingReservation = await Parking.findById(reservationId);
        
        if (!existingReservation) {
            throw new Error('Reservation not found');
        }

        if (updateData.status) {
            existingReservation.status = updateData.status;
        }

        if (updateData.vehicleId) {
            existingReservation.vehicleId = updateData.vehicleId;
        }

        if (updateData.status === 'cancelled') {
            await Slot.findByIdAndUpdate(existingReservation.slotId, { 
                status: 'available' 
            });
        }

        await existingReservation.save();

        return existingReservation;
    } catch (error) {
        throw error;
    }
};

const cancelReservation = async (reservationId) => {
    try {
        const reservation = await Parking.findByIdAndUpdate(
            reservationId, 
            { status: 'cancelled' }, 
            { new: true }
        );
        
        if (!reservation) {
            throw new Error('Reservation not found');
        }

        await Slot.findByIdAndUpdate(reservation.slotId, { 
            status: 'available' 
        });

        return reservation;
    } catch (error) {
        throw error;
    }
};

const getAvailableSlots = async (filters = {}) => {
    const { garageId, slotType } = filters;

    const query = { status: 'available' };
    
    if (garageId) {
        query.garageId = new mongoose.Types.ObjectId(garageId);
    }

    const availableSlots = await Slot.find(query)
        .populate({
            path: 'garageId',
            select: 'name location slotTypes pricePerHour'
        });

    return slotType 
        ? availableSlots.filter(slot => 
            slot.garageId.slotTypes.includes(slotType)
        )
        : availableSlots;
};

const getParkingPricing = async (filters = {}) => {
    const { garageId } = filters;

    const query = garageId 
        ? { _id: new mongoose.Types.ObjectId(garageId) }
        : {};

    const garages = await Garage.find(query).select('name location slotTypes pricePerHour');

    if (garages.length === 0 && garageId) {
        throw new Error('Garage not found');
    }

    return garages.map(garage => ({
        garageId: garage._id,
        name: garage.name,
        location: garage.location,
        slotTypes: garage.slotTypes,
        pricePerHour: garage.pricePerHour,
        pricingDetails: {
            standard: garage.pricePerHour,
            discounts: {
                hourly: {
                    '6-hours': garage.pricePerHour * 3.5,
                    'daily': garage.pricePerHour * 12 
                }
            }
        }
    }));
};

module.exports = { createReservation, getParkingPricing, getAvailableSlots, listAllReservations, getUserReservations, getReservation, updateReservation, cancelReservation  };