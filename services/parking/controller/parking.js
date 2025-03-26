const { publishMessage } = require('../utils/kafka');
const { createReservation, getAvailableSlots, getParkingPricing, listAllReservations, getUserReservations, getReservation, updateReservation, cancelReservation } = require("../service/parking");

const reserveSlot = async (req, res) => {
    const userId = req.user.id;
    const { slotId, vehicleId, garageId, pricePerHour, endTime } = req.body;

    if (!slotId || !userId || !vehicleId || !garageId || !pricePerHour || !endTime) {
        return res.status(400).json({
            success: false,
            message: "All fields (slotId, userId, vehicleId, garageId, pricePerHour, endTime) are required"
        });
    }

    try {
        const reservation = await createReservation({
            userId, vehicleId, garageId, slotId, pricePerHour, endTime
        });

        await publishMessage('slot_reserved', {
            slotId: reservation.slotId,
            userId: reservation.userId,
            vehicleId: reservation.vehicleId,
            garageId: reservation.garageId,
            price: reservation.totalCharge,
            reservationId: reservation._id,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'Slot reserved successfully',
            reservation
        })
    } catch (error) {
        console.error('❌ Error reserving slot:', error);
        
        if (error.message === 'Slot not found') {
            return res.status(404).json({
                success: false,
                message: 'Slot not found'
            });
        }

        if (error.message === 'Slot is already reserved or occupied') {
            return res.status(409).json({
                success: false,
                message: 'Slot is already reserved or occupied'
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getAllReservations = async (req, res) => {
    const userId = req.user.id;
    const { status } = req.query;

    try {
        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required." });
        }

        const reservations = await listAllReservations({ userId, status });

        res.status(200).json({
            success: true,
            count: reservations.length,
            reservations
        });
    } catch (error) {
        console.error('❌ Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

const getAllReservationsOfUser = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const reservations = await getUserReservations(userId);

        res.status(200).json({
            success: true,
            count: reservations.length,
            reservations
        });
    } catch (error) {
        console.error('❌ Error fetching user reservations:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

const getReservationById = async (req, res) => {
    const { reservationId } = req.params;

    try {
        if (!reservationId) {
            return res.status(400).json({
                success: false,
                message: 'Reservation ID is required'
            });
        }

        const reservation = await getReservation(reservationId);

        res.status(200).json({
            success: true,
            reservation
        });
    } catch (error) {
        console.error('❌ Error fetching reservation:', error);
        
        if (error.message === 'Reservation not found') {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updateReservationDetails = async (req, res) => {
    const { reservationId } = req.params;
    const { status, vehicleId } = req.body;

    try {
        if (!reservationId) {
            return res.status(400).json({
                success: false,
                message: 'Reservation ID is required'
            });
        }

        if (!status && !vehicleId) {
            return res.status(400).json({
                success: false,
                message: 'At least one update field (status or vehicleId) is required'
            });
        }

        const updatedReservation = await updateReservation(reservationId, { status, vehicleId });

         // Publish event to Kafka
            // await publishMessage('reservation_updated', {
            //     reservationId,
            //     status: existingReservation.status,
            //     timestamp: new Date().toISOString()
            // });

        res.status(200).json({
            success: true,
            message: 'Reservation updated successfully',
            reservation: updatedReservation
        });
    } catch (error) {
        console.error('❌ Error updating reservation:', error);
        
        if (error.message === 'Reservation not found') {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating reservation',
            error: error.message
        });
    }
};

const cancelReservationRequest = async (req, res) => {
    const { reservationId } = req.params;

    try {
        if (!reservationId) {
            return res.status(400).json({
                success: false,
                message: 'Reservation ID is required'
            });
        }

        const cancelledReservation = await cancelReservation(reservationId);

        // Publish event to Kafka
            // await publishMessage('reservation_cancelled', {
            //     reservationId,
            //     userId: reservation.userId,
            //     slotId: reservation.slotId,
            //     timestamp: new Date().toISOString()
            // });

        res.status(200).json({
            success: true,
            message: 'Reservation cancelled successfully',
            reservation: cancelledReservation
        });
    } catch (error) {
        console.error('❌ Error cancelling reservation:', error);
        
        if (error.message === 'Reservation not found') {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error cancelling reservation',
            error: error.message
        });
    }
};

const listAvailableSlots = async (req, res) => {
    const { garageId, slotType } = req.query;

    try {
        if (!garageId && !slotType) {
            return res.status(400).json({ success: false, message: "Atleast one is required Garage Id or slot type." });
        }

        const availableSlots = await getAvailableSlots({ garageId, slotType });

        res.status(200).json({
            success: true,
            count: availableSlots.length,
            availableSlots
        });
    } catch (error) {
        console.error('❌ Error fetching available slots:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available slots',
        });
    }
};

const listParkingPricing = async (req, res) => {
    const { garageId } = req.query;

    try {
        const pricingDetails = await getParkingPricing({ garageId });

        res.status(200).json({
            success: true,
            count: pricingDetails.length,
            pricingDetails
        });
    } catch (error) {
        console.error('❌ Error fetching parking pricing:', error);

        if (error.message === 'Garage not found') {
            return res.status(404).json({
                success: false,
                message: 'Specified garage not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching parking pricing',
        });
    }
};

module.exports = { reserveSlot, listParkingPricing, listAvailableSlots, getAllReservations, getAllReservationsOfUser, getReservationById, updateReservationDetails, cancelReservationRequest };