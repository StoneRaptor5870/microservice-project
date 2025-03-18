const { Router } = require('express');
const { authenticateUser, authorizeRole } = require('../middleware/auth');
const { register, login, getUser, updateUser, deleteUser, promoteToAdmin } = require('../controller/user');
const { addVehicle, getUserVehicles, removeVehicle } = require('../controller/vehicle');

const router = Router();

router.post('/login', login);
router.post('/register', register);

router.get('/me', authenticateUser, getUser);
router.put('/update', authenticateUser, updateUser);

router.delete('users/delete/:userId', authenticateUser, authorizeRole("admin"), deleteUser);
router.put('users/:userId/promote', authenticateUser, authorizeRole("admin"), promoteToAdmin)

router.post('users/:userId/vehicles', authenticateUser, addVehicle);
router.get('users/:userId/vehicles', authenticateUser, getUserVehicles);
router.delete('users/:userId/vehicles/:vehicleId', authenticateUser, removeVehicle);

module.exports = router;