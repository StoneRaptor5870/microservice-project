const { Router } = require('express');
const { authenticateUser, authorizeRole } = require('../middleware/auth');
const { register, login, getUser, updateUser, forgotPassword, updatePassword, uploadProfilePicture } = require('../controller/user');
const { addVehicle, getUserVehicles, removeVehicle, getVehicleById, updateVehicle } = require('../controller/vehicle');
const { promoteToAdmin, getAllUsers, getUserById, updateUserById, demoteToUser, deleteUser } = require('../controller/admin');

const router = Router();

// Users
router.post('/login', login);
router.post('/register', register);

router.get('/users/me', authenticateUser, getUser);
router.put('/users/me', authenticateUser, updateUser);
router.post('/users/forgot-password', forgotPassword);
router.put('/users/me/password', authenticateUser, updatePassword);
router.post('/users/me/profile-picture', authenticateUser, uploadProfilePicture);

// Admin
router.get('/admin/users', authenticateUser, authorizeRole("admin"), getAllUsers);
router.get('/admin/users/:userId', authenticateUser, authorizeRole("admin"), getUserById);
router.put('/admin/users/:userId', authenticateUser, authorizeRole("admin"), updateUserById);
router.put('/admin/users/:userId/promote', authenticateUser, authorizeRole("admin"), promoteToAdmin);
router.put('/admin/users/:userId/demote', authenticateUser, authorizeRole("admin"), demoteToUser);
// router.put('/admin/users/:userId/assign-valet', authenticateUser, authorizeRole("admin"), assignValetRole);
router.delete('/admin/users/:userId', authenticateUser, authorizeRole("admin"), deleteUser);

// Vehicles
router.post('/users/:userId/vehicles', authenticateUser, addVehicle);
router.get('/users/:userId/vehicles', authenticateUser, getUserVehicles);
router.get('/users/vehicles/:vehicleId', authenticateUser, getVehicleById);
router.put('/users/vehicles/:vehicleId', authenticateUser, updateVehicle);
router.delete('/users/:userId/vehicles/:vehicleId', authenticateUser, removeVehicle);

// Valet
// router.get('/valet/assignments', authenticateUser, authorizeRole("valet"), getValetAssignments);
// router.put('/valet/assignments/:assignmentId', authenticateUser, authorizeRole("valet"), updateAssignmentStatus);

module.exports = router;