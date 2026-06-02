const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateVehicleInput } = require('../middleware/validationMiddleware');

// Bảo vệ tất cả API quản lý xe bằng token đăng nhập
router.use(verifyToken);

router.get('/', vehicleController.getAllVehicles);
router.get('/dashboard-stats', vehicleController.getDashboardStats);
router.get('/reports/revenue', vehicleController.getRevenueReport);
router.get('/reports/logs', vehicleController.getParkingLogs);
router.get('/reports/alerts', vehicleController.getAlertLogs);
router.post('/', validateVehicleInput, vehicleController.createVehicle);
router.put('/:id', validateVehicleInput, vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);
router.post('/:id/extend', vehicleController.extendVehicle);
router.get('/rates', vehicleController.getParkingRates);

module.exports = router;
