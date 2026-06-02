const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tất cả API cấu hình hệ thống và quản lý đều yêu cầu JWT xác thực
router.use(verifyToken);

// 1. Cấu hình thông tin bãi xe
router.get('/info', configController.getParkingInfo);
router.put('/info', configController.updateParkingInfo);

// 2. Cấu hình bảng giá
router.get('/rates', configController.getParkingRates);
router.put('/rates', configController.updateParkingRates);

// 3. Cấu hình màn hình barrier
router.get('/screens', configController.getBarrierScreens);
router.put('/screens', configController.updateBarrierScreens);

// 4. Thiết lập hệ thống (Switches) & Actions (Backup / Reboot)
router.get('/system', configController.getSystemSettings);
router.put('/system', configController.updateSystemSettings);
router.post('/system/backup', configController.backupSystem);
router.post('/system/reboot', configController.rebootSystem);

// 5. Quản lý thiết bị phần cứng (CRUD)
router.get('/devices', configController.getAllDevices);
router.post('/devices', configController.createDevice);
router.put('/devices/:id', configController.updateDevice);
router.delete('/devices/:id', configController.deleteDevice);

// 6. Quản lý tài khoản nhân viên (CRUD)
router.get('/staff', configController.getAllStaff);
router.post('/staff', configController.createStaff);
router.put('/staff/:id', configController.updateStaff);
router.delete('/staff/:id', configController.deleteStaff);

// 7. Mở Barrier cưỡng bức (Giám sát)
router.post('/system/open-barrier', configController.openBarrier);

module.exports = router;
