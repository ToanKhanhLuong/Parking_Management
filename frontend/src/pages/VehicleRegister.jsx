import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerVehicleAPI } from '../services/vehicleService';
import { FiPlus, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import './VehiclePages.css';

export default function VehicleRegister() {
  const navigate = useNavigate();
  
  // Trạng thái Form
  const [formData, setFormData] = useState({
    plate_number: '',
    representative_name: '',
    phone: '',
    cccd: '',
    address: '',
    vehicle_type: 'Ô tô',
    card_type: 'Vé Tháng',
    card_code: '',
    brand: '',
    color: '',
    expiry_date: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Validate biển số (ví dụ đơn giản: không được chứa dấu cách hoặc ký tự đặc biệt lạ, viết hoa toàn bộ)
  const formatPlate = (val) => {
    return val.replace(/\s+/g, '').toUpperCase();
  };

  const handlePlateChange = (e) => {
    setFormData({
      ...formData,
      plate_number: formatPlate(e.target.value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    // Đơn giản hóa kiểm tra dữ liệu đầu vào
    if (!formData.plate_number) {
      setError('Vui lòng nhập biển số xe.');
      setLoading(false);
      return;
    }

    try {
      const res = await registerVehicleAPI(formData);
      setSuccess(res.message || 'Đăng ký phương tiện thành công!');
      
      // Reset form nhưng giữ lại loại thẻ/loại xe để dễ đăng ký tiếp
      setFormData({
        plate_number: '',
        representative_name: '',
        phone: '',
        cccd: '',
        address: '',
        vehicle_type: formData.vehicle_type,
        card_type: formData.card_type,
        card_code: '',
        brand: '',
        color: '',
        expiry_date: ''
      });
      
      // Cuộn lên đầu trang để xem banner thành công
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Lỗi server khi đăng ký phương tiện.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-header-title">Đăng Ký Thành Viên / Xe Mới</h1>
          <p className="page-subtitle">Thêm mới thông tin chủ xe và đăng ký cấp thẻ gửi xe cố định hàng tháng</p>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/dashboard/vehicles')}>
          <FiArrowLeft />
          <span>Danh sách xe</span>
        </button>
      </div>

      {success && (
        <div className="success-banner">
          <FiCheckCircle size={20} />
          <div>
            <div style={{ fontWeight: 700 }}>Thành công!</div>
            <div>{success}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <FiAlertCircle size={20} />
          <div>
            <div style={{ fontWeight: 700 }}>Đã xảy ra lỗi!</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ padding: '32px' }}>
          {/* PHẦN 1: THÔNG TIN CHỦ HỘ / ĐẠI DIỆN */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--primary)' }}>
              1. Thông Tin Khách Hàng / Chủ Xe
            </h3>
            
            <div className="form-row-grid">
              <div className="form-group-col">
                <label className="form-label form-label-required">Họ và Tên Chủ Xe</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập đầy đủ họ tên..."
                  required
                  value={formData.representative_name}
                  onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
                />
              </div>
              <div className="form-group-col">
                <label className="form-label form-label-required">Số Điện Thoại</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="Nhập số điện thoại liên lạc..."
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-grid">
              <div className="form-group-col">
                <label className="form-label">Số CCCD / Hộ Chiếu</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập số căn cước công dân..."
                  value={formData.cccd}
                  onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                />
              </div>
              <div className="form-group-col">
                <label className="form-label">Địa Chỉ Thường Trú</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Số nhà, căn hộ, phòng ban..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* PHẦN 2: ĐĂNG KÝ PHƯƠNG TIỆN & THẺ TỪ */}
          <div>
            <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--primary)' }}>
              2. Thông Tin Phương Tiện & Cấp Thẻ
            </h3>

            <div className="form-row-grid">
              <div className="form-group-col">
                <label className="form-label form-label-required">Biển Số Xe</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ví dụ: 30F-555.66 hoặc 29D1-123.45"
                  required
                  value={formData.plate_number}
                  onChange={handlePlateChange}
                  style={{ fontWeight: 700, letterSpacing: '0.5px' }}
                />
              </div>
              <div className="form-group-col">
                <label className="form-label">Mã Thẻ Từ (Không bắt buộc)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Quét thẻ lên đầu đọc hoặc nhập mã RFID..."
                  value={formData.card_code}
                  onChange={(e) => setFormData({ ...formData, card_code: e.target.value })}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="form-row-grid">
              <div className="form-group-col">
                <label className="form-label form-label-required">Loại Phương Tiện</label>
                <select 
                  className="form-input"
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                >
                  <option value="Ô tô">Ô tô (Car)</option>
                  <option value="Xe máy">Xe máy (Motorbike)</option>
                </select>
              </div>
              <div className="form-group-col">
                <label className="form-label form-label-required">Loại Thẻ Cấp Phát</label>
                <select 
                  className="form-input"
                  value={formData.card_type}
                  onChange={(e) => setFormData({ ...formData, card_type: e.target.value })}
                >
                  <option value="Vé Tháng">Vé Tháng (Subscription)</option>
                  <option value="Thẻ VIP">Thẻ VIP (Permanent / Free)</option>
                </select>
              </div>
            </div>

            <div className="form-row-grid">
              <div className="form-group-col">
                <label className="form-label">Hãng Xe / Hiệu Xe</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="E.g. Toyota Vios, Honda SH..."
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="form-group-col">
                <label className="form-label">Màu Sắc Xe</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="E.g. Trắng, Đen, Xám lông chuột..."
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-grid">
              <div className="form-group-col">
                <label className="form-label">Hạn Sử Dụng Ban Đầu</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
              <div className="form-group-col" style={{ justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <FiInfo size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <span>
                    Nếu để trống, hệ thống sẽ tự động cấp hạn sử dụng <b>1 tháng</b> cho Vé Tháng và <b>1 năm</b> cho Thẻ VIP kể từ ngày hôm nay.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '40px' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard/vehicles')}>
            Hủy Bỏ
          </button>
          <button type="submit" className="btn-primary-action" disabled={loading} style={{ padding: '12px 28px', borderRadius: '8px' }}>
            <FiPlus />
            <span>{loading ? 'Đang xử lý đăng ký...' : 'Xác Nhận Đăng Ký'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
