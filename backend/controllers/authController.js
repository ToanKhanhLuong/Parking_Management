const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
        }

        const user = rows[0];

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác!' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, fullname: user.fullname },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Đăng nhập thành công!',
            token,
            user: { id: user.id, username: user.username, fullname: user.fullname, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server!' });
    }
};

// Hàm phụ để bạn test tạo tài khoản mẫu
exports.register = async (req, res) => {
    try {
        const { username, fullname, password, role } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.execute(
            'INSERT INTO users (username, fullname, password, role) VALUES (?, ?, ?, ?)',
            [username, fullname, hashedPassword, role || 'Admin']
        );

        res.status(201).json({ message: 'Tạo tài khoản thành công!', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tạo tài khoản.' });
    }
};