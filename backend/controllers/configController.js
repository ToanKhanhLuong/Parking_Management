const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ==========================================
// 1. Cấu hình Thông Tin Bãi Xe
// ==========================================
exports.getParkingInfo = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM parking_config WHERE id = 1');
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy cấu hình bãi xe!' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Lỗi lấy thông tin bãi xe:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin bãi xe!' });
    }
};

exports.updateParkingInfo = async (req, res) => {
    try {
        const { park_name, address, capacity, currency, led_message, logo } = req.body;
        
        await db.query(
            `UPDATE parking_config 
             SET park_name = ?, address = ?, capacity = ?, currency = ?, led_message = ?, logo = COALESCE(?, logo)
             WHERE id = 1`,
            [park_name, address, Number(capacity), currency, led_message, logo || null]
        );

        res.status(200).json({ message: 'Cập nhật thông tin bãi xe thành công!' });
    } catch (error) {
        console.error('Lỗi cập nhật thông tin bãi xe:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin bãi xe!' });
    }
};

// ==========================================
// 2. Cấu hình Bảng Giá Vé (parking_rates)
// ==========================================
exports.getParkingRates = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM parking_rates WHERE id = 1');
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy cấu hình bảng giá!' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Lỗi lấy bảng giá:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy bảng giá!' });
    }
};

exports.updateParkingRates = async (req, res) => {
    try {
        const {
            car_first_2_hours,
            car_next_hour,
            car_overnight,
            car_monthly,
            motorbike_4_hours,
            motorbike_overnight,
            motorbike_monthly
        } = req.body;

        await db.query(
            `UPDATE parking_rates 
             SET 
                car_first_2_hours = ?, 
                car_next_hour = ?, 
                car_overnight = ?, 
                car_monthly = ?, 
                motorbike_4_hours = ?, 
                motorbike_overnight = ?, 
                motorbike_monthly = ?
             WHERE id = 1`,
            [
                Number(car_first_2_hours),
                Number(car_next_hour),
                Number(car_overnight),
                Number(car_monthly),
                Number(motorbike_4_hours),
                Number(motorbike_overnight),
                Number(motorbike_monthly)
            ]
        );

        res.status(200).json({ message: 'Cập nhật bảng giá vé thành công!' });
    } catch (error) {
        console.error('Lỗi cập nhật bảng giá:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật bảng giá!' });
    }
};

// ==========================================
// 3. Cấu hình Màn Hình Barrier (Entrance/Exit)
// ==========================================
exports.getBarrierScreens = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT screen_in_image, screen_in_video, screen_out_image, screen_out_video FROM parking_config WHERE id = 1'
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy cấu hình màn hình!' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Lỗi lấy cấu hình màn hình:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy cấu hình màn hình!' });
    }
};

exports.updateBarrierScreens = async (req, res) => {
    try {
        const { screen_in_image, screen_in_video, screen_out_image, screen_out_video } = req.body;

        await db.query(
            `UPDATE parking_config 
             SET screen_in_image = ?, screen_in_video = ?, screen_out_image = ?, screen_out_video = ?
             WHERE id = 1`,
            [screen_in_image, screen_in_video, screen_out_image, screen_out_video]
        );

        res.status(200).json({ message: 'Cập nhật cấu hình màn hình barrier thành công!' });
    } catch (error) {
        console.error('Lỗi cập nhật cấu hình màn hình:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật cấu hình màn hình!' });
    }
};

// ==========================================
// 4. Thiết lập hệ thống (QR, Maintenance, Actions)
// ==========================================
exports.getSystemSettings = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT qr_active, maintenance_active FROM parking_config WHERE id = 1');
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thiết lập hệ thống!' });
        }
        res.status(200).json({
            qr_active: !!rows[0].qr_active,
            maintenance_active: !!rows[0].maintenance_active
        });
    } catch (error) {
        console.error('Lỗi lấy thiết lập hệ thống:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thiết lập hệ thống!' });
    }
};

exports.updateSystemSettings = async (req, res) => {
    try {
        const { qr_active, maintenance_active } = req.body;

        await db.query(
            `UPDATE parking_config 
             SET qr_active = ?, maintenance_active = ?
             WHERE id = 1`,
            [qr_active ? 1 : 0, maintenance_active ? 1 : 0]
        );

        res.status(200).json({ message: 'Cập nhật thiết lập hệ thống thành công!' });
    } catch (error) {
        console.error('Lỗi cập nhật thiết lập hệ thống:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật thiết lập hệ thống!' });
    }
};

exports.backupSystem = async (req, res) => {
    try {
        // Mô phỏng quá trình backup dữ liệu thực tế
        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
        res.status(200).json({
            message: `Sao lưu cơ sở dữ liệu thành công! File lưu trữ: backups/backup_${dateStr}_prod.sql`
        });
    } catch (error) {
        res.status(500).json({ message: 'Thất bại khi sao lưu dữ liệu!' });
    }
};

exports.rebootSystem = async (req, res) => {
    try {
        // Mô phỏng quá trình reboot hệ thống
        res.status(200).json({
            message: 'Đang khởi động lại dịch vụ điều hành bãi đỗ xe... Hệ thống sẽ sẵn sàng sau 10 giây.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Khởi động lại hệ thống thất bại!' });
    }
};

// ==========================================
// 5. Quản lý Thiết bị (devices CRUD)
// ==========================================
exports.getAllDevices = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM devices ORDER BY id ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Lỗi lấy danh sách thiết bị:', error);
        res.status(500).json({ message: 'Lỗi server khi tải danh sách thiết bị!' });
    }
};

exports.createDevice = async (req, res) => {
    try {
        const { device_name, device_type, gate, ip_address, status } = req.body;
        if (!device_name || !device_type) {
            return res.status(400).json({ message: 'Vui lòng điền tên thiết bị và loại thiết bị!' });
        }

        const [result] = await db.query(
            `INSERT INTO devices (device_name, device_type, gate, ip_address, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [device_name, device_type, gate || 'Khác', ip_address || '', status || 'offline']
        );

        res.status(201).json({ message: 'Thêm thiết bị mới thành công!', deviceId: result.insertId });
    } catch (error) {
        console.error('Lỗi tạo thiết bị:', error);
        res.status(500).json({ message: 'Lỗi server khi thêm thiết bị!' });
    }
};

exports.updateDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { device_name, device_type, gate, ip_address, status } = req.body;

        await db.query(
            `UPDATE devices 
             SET device_name = ?, device_type = ?, gate = ?, ip_address = ?, status = ?
             WHERE id = ?`,
            [device_name, device_type, gate, ip_address, status, id]
        );

        res.status(200).json({ message: 'Cập nhật thiết bị thành công!' });
    } catch (error) {
        console.error('Lỗi cập nhật thiết bị:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật thiết bị!' });
    }
};

exports.deleteDevice = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM devices WHERE id = ?', [id]);
        res.status(200).json({ message: 'Xóa thiết bị thành công!' });
    } catch (error) {
        console.error('Lỗi xóa thiết bị:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa thiết bị!' });
    }
};

// ==========================================
// 6. Quản lý Tài khoản Nhân viên (users CRUD)
// ==========================================
exports.getAllStaff = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, fullname, role, status, created_at FROM users ORDER BY id ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Lỗi lấy danh sách nhân sự:', error);
        res.status(500).json({ message: 'Lỗi server khi tải danh sách nhân viên!' });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const { username, fullname, password, role, status } = req.body;
        
        if (!username || !fullname || !password || !role) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc!' });
        }

        // Kiểm tra xem username đã tồn tại chưa
        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: `Tên đăng nhập "${username}" đã tồn tại trên hệ thống!` });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            `INSERT INTO users (username, fullname, password, role, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [username, fullname, hashedPassword, role, status || 'ACTIVE']
        );

        res.status(201).json({ message: 'Tạo tài khoản nhân viên thành công!', staffId: result.insertId });
    } catch (error) {
        console.error('Lỗi tạo tài khoản nhân viên:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo tài khoản nhân viên!' });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, role, status, password } = req.body;

        if (!fullname || !role || !status) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin!' });
        }

        // Kiểm tra nếu là admin gốc (ID = 1) thì không cho đổi role hoặc status sang INACTIVE để tránh lỗi hệ thống
        if (Number(id) === 1 && (role !== 'Admin' || status !== 'ACTIVE')) {
            return res.status(400).json({ message: 'Không thể thay đổi quyền hạn hoặc khóa tài khoản Admin gốc!' });
        }

        if (password && password.trim() !== '') {
            // Cần cập nhật mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await db.query(
                `UPDATE users SET fullname = ?, role = ?, status = ?, password = ? WHERE id = ?`,
                [fullname, role, status, hashedPassword, id]
            );
        } else {
            // Không cập nhật mật khẩu
            await db.query(
                `UPDATE users SET fullname = ?, role = ?, status = ? WHERE id = ?`,
                [fullname, role, status, id]
            );
        }

        res.status(200).json({ message: 'Cập nhật tài khoản thành công!' });
    } catch (error) {
        console.error('Lỗi cập nhật tài khoản nhân sự:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật tài khoản!' });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;

        if (Number(id) === 1) {
            return res.status(400).json({ message: 'Không thể xóa tài khoản Admin gốc!' });
        }

        // Kiểm tra xem user có đang xóa chính mình không
        if (Number(id) === req.user.id) {
            return res.status(400).json({ message: 'Bạn không thể xóa tài khoản của chính mình khi đang đăng nhập!' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ message: 'Xóa tài khoản nhân viên thành công!' });
    } catch (error) {
        console.error('Lỗi xóa nhân sự:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa nhân viên!' });
    }
};

// ==========================================
// 7. Mở Barrier cưỡng bức (Giám sát)
// ==========================================
exports.openBarrier = async (req, res) => {
    try {
        const { gate } = req.body;
        if (!gate) {
            return res.status(400).json({ message: 'Không xác định được làn điều khiển!' });
        }
        res.status(200).json({
            message: `🚀 Gửi lệnh mở Barrier thành công tại ${gate}!`
        });
    } catch (error) {
        res.status(500).json({ message: 'Không thể gửi lệnh mở Barrier!' });
    }
};
