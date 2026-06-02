// backend/middleware/validationMiddleware.js

exports.validateVehicleInput = (req, res, next) => {
    const { representative_name, phone, cccd } = req.body;

    // 1. Kiểm tra Họ và Tên (Chỉ cho phép nhập chữ cái Tiếng Việt và khoảng trắng)
    if (representative_name !== undefined) {
        if (!representative_name || representative_name.trim() === "") {
            return res.status(400).json({ message: "Họ và tên chủ xe không được để trống!" });
        }
        
        // Biểu thức chính quy hỗ trợ mọi chữ cái Tiếng Việt có dấu, chữ hoa, chữ thường và khoảng trắng
        const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯưăâêôơư\s']+$/;
        if (!nameRegex.test(representative_name)) {
            return res.status(400).json({ message: "Họ và tên không hợp lệ! Tên chỉ được chứa chữ cái tiếng Việt và khoảng trắng." });
        }
    }

    // 2. Kiểm tra Số điện thoại (Chỉ cho phép định dạng SĐT di động Việt Nam)
    if (phone !== undefined) {
        if (!phone || phone.trim() === "") {
            return res.status(400).json({ message: "Số điện thoại không được để trống!" });
        }

        // Loại bỏ khoảng trắng hoặc dấu gạch ngang nếu người dùng nhập vào
        const cleanPhone = phone.replace(/[\s.-]+/g, "");
        
        // Định dạng SĐT di động Việt Nam 10 chữ số (bắt đầu bằng 03, 05, 07, 08, 09 hoặc mã quốc gia +84)
        const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
        if (!phoneRegex.test(cleanPhone)) {
            return res.status(400).json({ message: "Số điện thoại không đúng định dạng Việt Nam! Phải có 10 chữ số và bắt đầu bằng 03, 05, 07, 08, 09." });
        }
    }

    // 3. Kiểm tra Căn cước công dân (CMND cũ có 9 số, CCCD mới có 12 số)
    if (cccd !== undefined && cccd !== null && cccd.trim() !== "") {
        const cleanCccd = cccd.replace(/[\s.-]+/g, "");
        
        // Phải là số và dài đúng 9 hoặc 12 số
        const cccdRegex = /^[0-9]{9}$|^[0-9]{12}$/;
        if (!cccdRegex.test(cleanCccd)) {
            return res.status(400).json({ message: "Căn cước công dân (CCCD) / CMND không hợp lệ! Phải chỉ chứa các chữ số và dài đúng 9 hoặc 12 số." });
        }
    }

    next();
};
