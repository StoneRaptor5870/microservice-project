const { Router } = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { reserveSlot, listAvailableSlots, listParkingPricing, getAllReservations, getAllReservationsOfUser, getReservationById, updateReservationDetails, cancelReservationRequest } = require('../controller/parking')
const { createGarage, getAllGarages, getGarage, updateGarage, deleteGarage, getAvailableSlotsByGarage, searchGaragesByLocation } = require("../controller/garages");
const { createSlot, getAllSlots, getSlotsByGarage, getSlotById, updateSlot, deleteSlot } = require("../controller/slots");

const router = Router();

// Garages
router.post('/parking/garages', authenticateToken, authorizeRole("admin"), createGarage);
router.get('/parking/garages', authenticateToken, getAllGarages);
router.get('/parking/garages/search', authenticateToken, searchGaragesByLocation);
router.get('/parking/garages/:garageId', authenticateToken, getGarage);
router.put('/parking/garages/:garageId', authenticateToken, authorizeRole("admin"), updateGarage);
router.delete('/parking/garages/:garageId', authenticateToken, authorizeRole("admin"), deleteGarage);
router.get('/parking/garages/:garageId/availability', authenticateToken, getAvailableSlotsByGarage);

// Slots
router.post('/parking/slots', authenticateToken, authorizeRole("admin"), createSlot);
router.get('/parking/slots', authenticateToken, authorizeRole("admin"), getAllSlots);
router.get('/parking/garages/:garageId/slots', authenticateToken, getSlotsByGarage);
router.get('/parking/slots/:slotId', authenticateToken, getSlotById);
router.put('/parking/slots/:slotId', authenticateToken, authorizeRole("admin"), updateSlot);
router.delete('/parking/slots/:slotId', authenticateToken, authorizeRole("admin"), deleteSlot);

// Reservations
router.post('/parking/reserveSlot', authenticateToken, reserveSlot);
router.get('/parking/reserveSlot', authenticateToken, getAllReservations);
router.get('/parking/reservations/user/:userId', authenticateToken, getAllReservationsOfUser);
router.get('/parking/reservations/:reservationId', authenticateToken, getReservationById);
router.put('/parking/reservations/:reservationId', authenticateToken, updateReservationDetails);
router.delete('/parking/reservations/:reservationId', authenticateToken, cancelReservationRequest);

// Availability & Pricing

router.get('/parking/availability', listAvailableSlots);
// router.get('/parking/availability/:slotType', listAvailableSlotsByType); query params: ?garageId=xyz&slotType=compact
router.get('/parking/pricing', listParkingPricing);

module.exports = router;