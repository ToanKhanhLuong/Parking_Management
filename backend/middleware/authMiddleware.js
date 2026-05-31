const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // 1. Lấy token từ header của request
    const authHeader = req.header('Authorization');
    
    // Kiểm tra xem người dùng có gửi token lên không
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Truy cập bị từ chối! Vui lòng đăng nhập.' });
    }

    // 2. Tách lấy phần chữ ký (Token)
    const token = authHeader.split(' ')[1];

    try {
        // 3. Giải mã token bằng chìa khóa bí mật trong file .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Gắn thông tin user vào request để các API phía sau sử dụng
        req.user = decoded; 
        
        // Cho phép đi tiếp vào API
        next(); 
    } catch (error) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

// Middleware kiểm tra quyền Admin (Dành cho các tính năng quản trị)
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này!' });
    }
};