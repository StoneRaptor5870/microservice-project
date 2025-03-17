const { publishMessage } = require('../utils/kafka');
const { Parking } = require('../database/db');

const reserveSlot = async (req, res) => {
    const { slotId, userId } = req.body;

    if (!slotId || !userId) {
        return res.status(400).json({
            success: false,
            message: "Slot ID and User ID are required"
        });
    }

    try {
        // Check if slot is already reserved
        const existingSlot = await Parking.findOne({ slotId, status: 'reserved' });
        if (existingSlot) {
            return res.status(409).json({
                success: false,
                message: 'Slot is already reserved.'
            });
        }

        // Create new reservation
        const reservation = await Parking.create({
            slotId,
            userId,
            status: 'reserved',
            assignedAt: new Date(),
            updatedAt: new Date()
        });

        // Publish event to Kafka
        await publishMessage('slot_reserved', {
            slotId,
            userId,
            reservationId: reservation._id,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'Slot reserved successfully',
            reservation
        });
    } catch (error) {
        console.error('❌ Error reserving slot:', error);
        res.status(500).json({
            success: false,
            message: 'Error reserving slot',
            error: error.message
        });
    }
};

module.exports = { reserveSlot };