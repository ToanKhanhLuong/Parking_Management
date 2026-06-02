CREATE DATABASE parking_management;
USE parking_management;

-- 1. Quản lý nhân sự/Admin
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    fullname VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Security', 'Accountant') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Quản lý nhóm khách hàng (Hộ gia đình / Công ty)
CREATE TABLE customer_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    representative_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    cccd VARCHAR(20),
    address VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Quản lý thành viên trong nhóm
CREATE TABLE group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    cccd VARCHAR(20),
    relationship VARCHAR(50),
    phone VARCHAR(20),
    status ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES customer_groups(id)
);

-- 4. Dữ liệu khuôn mặt (AI)
CREATE TABLE member_face_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    angle ENUM('FRONT', 'LEFT', 'RIGHT', 'UP', 'DOWN', 'OTHER') DEFAULT 'OTHER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES group_members(id)
);

-- 5. Quản lý xe đăng ký cố định (Có thêm mã thẻ từ)
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    plate_number VARCHAR(30) NOT NULL UNIQUE,
    card_code VARCHAR(50) UNIQUE NULL, -- Mã thẻ từ (RFID/Mifare)
    vehicle_type ENUM('Ô tô', 'Xe máy') NOT NULL,
    card_type ENUM('Vé Tháng', 'Thẻ VIP') DEFAULT 'Vé Tháng',
    brand VARCHAR(100),
    color VARCHAR(50),
    expiry_date DATE NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'BLOCKED', 'LOST') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES customer_groups(id)
);

-- 6. Quản lý thiết bị phần cứng
CREATE TABLE devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(100),
    device_type ENUM('camera', 'barrier', 'led', 'sensor') NOT NULL,
    gate ENUM('Làn Vào', 'Làn Ra', 'Khác') DEFAULT 'Khác',
    ip_address VARCHAR(50),
    status ENUM('online', 'offline', 'error') DEFAULT 'offline',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Log nhận diện AI (Lưu lịch sử camera đọc biển số/khuôn mặt)
CREATE TABLE recognition_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NULL,
    member_id INT NULL,
    detected_plate VARCHAR(30),
    detected_vehicle_type ENUM('Ô tô', 'Xe máy'),
    gate ENUM('Làn Vào', 'Làn Ra'),
    plate_confidence DECIMAL(5,2),
    face_confidence DECIMAL(5,2),
    plate_image_url VARCHAR(255),
    face_image_url VARCHAR(255),
    result ENUM('VALID', 'INVALID', 'NEED_MANUAL_CHECK') DEFAULT 'NEED_MANUAL_CHECK',
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    FOREIGN KEY (member_id) REFERENCES group_members(id) ON DELETE SET NULL
);

-- 8. Cấu hình & Bảng giá
CREATE TABLE parking_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    park_name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    capacity INT DEFAULT 0,
    currency VARCHAR(20) DEFAULT 'VNĐ',
    led_message VARCHAR(255),
    logo VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE parking_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_first_2_hours DECIMAL(12,2) DEFAULT 25000,
    car_next_hour DECIMAL(12,2) DEFAULT 10000,
    car_overnight DECIMAL(12,2) DEFAULT 100000,
    car_monthly DECIMAL(12,2) DEFAULT 1500000,
    motorbike_4_hours DECIMAL(12,2) DEFAULT 5000,
    motorbike_overnight DECIMAL(12,2) DEFAULT 10000,
    motorbike_monthly DECIMAL(12,2) DEFAULT 120000,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 9. Phiên đỗ xe (Cốt lõi để tính tiền và đối soát)
CREATE TABLE parking_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_code VARCHAR(50) NULL, -- Khách vãng lai quẹt thẻ sẽ lưu mã thẻ vào đây
    vehicle_id INT NULL, -- Sẽ có giá trị nếu là xe vé tháng, NULL nếu vãng lai
    plate_number VARCHAR(30),
    vehicle_type ENUM('Ô tô', 'Xe máy'),
    time_in DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_out DATETIME NULL,
    image_in VARCHAR(255),
    image_out VARCHAR(255),
    status ENUM('Đang đỗ', 'Đã ra', 'Lỗi/Cảnh báo') DEFAULT 'Đang đỗ',
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- 10. Thanh toán (Gắn chặt với Phiên đỗ xe)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL, -- Thanh toán cho lượt đỗ nào
    amount DECIMAL(12,2) NOT NULL,
    payment_type ENUM('Vé Lượt', 'Vé Tháng', 'Thẻ VIP', 'Phạt') NOT NULL,
    payment_method ENUM('Tiền mặt', 'QR', 'Chuyển khoản') DEFAULT 'Tiền mặt',
    status ENUM('PENDING', 'PAID', 'FAILED') DEFAULT 'PAID',
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES parking_sessions(id) ON DELETE CASCADE
);

-- 11. Đánh chỉ mục (Tối ưu tốc độ tìm kiếm siêu tốc)
CREATE INDEX idx_plate_number ON vehicles(plate_number);
CREATE INDEX idx_card_code ON vehicles(card_code);
CREATE INDEX idx_session_plate ON parking_sessions(plate_number);
CREATE INDEX idx_session_card ON parking_sessions(card_code);
CREATE INDEX idx_session_status ON parking_sessions(status);
