import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  getVehiclesAPI, extendVehicleAPI, getRatesAPI 
} from '../services/vehicleService';
import { 
  FiClock, FiSearch, FiCheckCircle, FiAlertCircle, FiCreditCard, FiCalendar, FiArrowLeft, FiUser, FiInfo 
} from 'react-icons/fi';
import './VehiclePages.css';

export default function ExtendTicket() {
  const navigate = useNavigate();
  const location = useLocation();

  // Biển số xe cần gia hạn được truyền từ trang danh sách (nếu có)
  const initialPlate = location.state?.plate_number || '';

  // States
  const [searchPlate, setSearchPlate] = useState(initialPlate);
  const [vehicle, setVehicle] = useState(null);
  const [rates, setRates] = useState({ car_monthly: 1500000, motorbike_monthly: 120000 });
  const [selectedMonths, setSelectedMonths] = useState(1);
  
  // Trạng thái tải & Báo lỗi
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Tải bảng giá đỗ xe
  const fetchRates = async () => {
    try {
      const data = await getRatesAPI();
      setRates(data);
    } catch (err) {
      console.error('Không thể lấy bảng giá dịch vụ:', err);
    }
  };

  useEffect(() => {
    fetchRates();
    if (initialPlate) {
      handleSearch(null, initialPlate);
    }
  }, [initialPlate]);

  // Tìm kiếm thông tin xe bằng biển số
  const handleSearch = async (e, directPlate = '') => {
    if (e) e.preventDefault();
    const plate = directPlate || searchPlate;
    if (!plate.trim()) return;

    setSearching(true);
    setSearchError('');
    setSuccess('');
    setError('');
    setVehicle(null);

    try {
      // Gọi danh sách xe lọc chính xác theo biển số
      const list = await getVehiclesAPI({ search: plate.trim() });
      const found = list.find(v => v.plate_number.toUpperCase() === plate.trim().toUpperCase());
      
      if (!found) {
        setSearchError(`Không tìm thấy phương tiện đăng ký với biển số "${plate}".`);
      } else {
        setVehicle(found);
      }
    } catch (err) {
      setSearchError(err.message || 'Lỗi khi tìm kiếm phương tiện.');
    } finally {
      setSearching(false);
    }
  };

  // Submit gia hạn vé
  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!vehicle) return;

    setSubmitting(true);
    setSuccess('');
    setError('');

    try {
      const res = await extendVehicleAPI(vehicle.id, selectedMonths);
      setSuccess(`Gia hạn thành công! ${res.message}`);
      
      // Cập nhật thông tin xe hiển thị trên giao diện
      setVehicle({
        ...vehicle,
        expiry_date: res.newExpiryDate,
        status: 'ACTIVE'
      });
    } catch (err) {
      setError(err.message || 'Gia hạn vé phương tiện thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Định dạng tiền tệ VND
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Định dạng ngày hiển thị đẹp
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Tính toán số tiền gia hạn dựa trên loại xe
  const getMonthlyRate = () => {
    if (!vehicle) return 0;
    return vehicle.vehicle_type === 'Ô tô' ? Number(rates.car_monthly) : Number(rates.motorbike_monthly);
  };

  // Tính toán tổng tiền có áp dụng ưu đãi chiết khấu
  const calculateTotal = (months) => {
    const basePrice = getMonthlyRate() * months;
    if (months === 3) return basePrice * 0.95; // Chiết khấu 5% khi đóng 3 tháng
    if (months === 6) return basePrice * 0.9;  // Chiết khấu 10% khi đóng 6 tháng
    return basePrice;
  };

  // Tính ngày hết hạn dự kiến mới
  const getExpectedExpiryDate = () => {
    if (!vehicle) return '';
    let baseDate = new Date();
    if (vehicle.expiry_date && new Date(vehicle.expiry_date) > new Date()) {
      baseDate = new Date(vehicle.expiry_date);
    }
    baseDate.setMonth(baseDate.getMonth() + selectedMonths);
    return baseDate;
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-header-title">Gia Hạn Vé Gửi Xe</h1>
          <p className="page-subtitle">Gia hạn thời hạn sử dụng vé tháng, đóng phí đỗ xe định kỳ cho phương tiện</p>
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
            <div style={{ fontWeight: 700 }}>Gia Hạn Thành Công!</div>
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

      {/* Tra cứu biển số */}
      <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto 24px auto' }}>
        <form onSubmit={(e) => handleSearch(e)}>
          <div className="plate-lookup-box">
            <div className="form-group-col">
              <label className="form-label form-label-required">Nhập Biển Số Xe Tra Cứu</label>
              <div className="search-input-wrapper">
                <FiSearch className="search-input-icon" />
                <input 
                  type="text" 
                  className="search-control" 
                  placeholder="E.g. 30F-555.66..."
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value.replace(/\s+/g, '').toUpperCase())}
                />
              </div>
            </div>
            <button type="submit" className="btn-lookup" disabled={searching}>
              {searching ? 'Đang tìm...' : 'Tra Cứu'}
            </button>
          </div>
        </form>

        {searchError && (
          <div className="error-banner" style={{ margin: 0 }}>
            <FiAlertCircle /> {searchError}
          </div>
        )}
      </div>

      {/* Thông tin chi tiết & Bảng gia hạn */}
      {vehicle && (
        <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          {/* Thông tin xe hiện tại */}
          <div className="info-summary-panel">
            <h4 className="info-summary-title">Thông Tin Phương Tiện</h4>
            
            <div className="info-summary-grid">
              <div className="info-summary-item">
                <span className="info-summary-label">Biển Số Xe</span>
                <div>
                  <span className="plate-tag" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                    {vehicle.plate_number}
                  </span>
                </div>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">Chủ Xe</span>
                <span className="info-summary-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiUser color="var(--primary)" /> {vehicle.representative_name}
                </span>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">Số Điện Thoại</span>
                <span className="info-summary-val">{vehicle.phone || '-'}</span>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">Loại Thẻ / Xe</span>
                <span className="info-summary-val">
                  {vehicle.card_type} ({vehicle.vehicle_type})
                </span>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">Ngày Hết Hạn Hiện Tại</span>
                <span className="info-summary-val" style={{ color: new Date(vehicle.expiry_date) < new Date() ? 'var(--danger)' : 'var(--success)' }}>
                  {formatDate(vehicle.expiry_date)}
                </span>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">Đơn Giá Vé Tháng</span>
                <span className="info-summary-val" style={{ color: 'var(--primary)' }}>
                  {formatCurrency(getMonthlyRate())} / tháng
                </span>
              </div>
            </div>
          </div>

          {vehicle.card_type === 'Thẻ VIP' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: '#f3f0ff', borderRadius: '8px', color: '#7950f2', fontWeight: 600, fontSize: '0.9rem' }}>
              <FiInfo size={20} />
              <span>Đây là Thẻ VIP, không phát sinh phí hàng tháng. Hạn dùng tự động dài hạn.</span>
            </div>
          ) : (
            <form onSubmit={handleExtendSubmit}>
              {/* Chọn các gói gia hạn */}
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Chọn Gói Gia Hạn Vé</label>
                
                <div className="extend-cards-grid">
                  <div 
                    className={`extend-option-card ${selectedMonths === 1 ? 'card-selected' : ''}`}
                    onClick={() => setSelectedMonths(1)}
                  >
                    <span className="extend-months-num">1</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Tháng</span>
                    <span className="extend-price-tag">{formatCurrency(calculateTotal(1))}</span>
                  </div>

                  <div 
                    className={`extend-option-card ${selectedMonths === 3 ? 'card-selected' : ''}`}
                    onClick={() => setSelectedMonths(3)}
                  >
                    <span className="extend-saving-badge">Tiết kiệm 5%</span>
                    <span className="extend-months-num">3</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Tháng</span>
                    <span className="extend-price-tag" style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: '#94a3b8' }}>
                      {formatCurrency(getMonthlyRate() * 3)}
                    </span>
                    <span className="extend-price-tag">{formatCurrency(calculateTotal(3))}</span>
                  </div>

                  <div 
                    className={`extend-option-card ${selectedMonths === 6 ? 'card-selected' : ''}`}
                    onClick={() => setSelectedMonths(6)}
                  >
                    <span className="extend-saving-badge" style={{ backgroundColor: '#10b981' }}>Tiết kiệm 10%</span>
                    <span className="extend-months-num">6</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Tháng</span>
                    <span className="extend-price-tag" style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: '#94a3b8' }}>
                      {formatCurrency(getMonthlyRate() * 6)}
                    </span>
                    <span className="extend-price-tag">{formatCurrency(calculateTotal(6))}</span>
                  </div>
                </div>
              </div>

              {/* Chi tiết thanh toán & Gia hạn dự kiến */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.92rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Thời gian gia hạn mới:</span>
                  <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiCalendar color="var(--primary)" /> {formatDate(getExpectedExpiryDate())}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.05rem', borderTop: '1px dashed var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Tổng Tiền Thanh Toán:</span>
                  <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '1.3rem' }}>
                    {formatCurrency(calculateTotal(selectedMonths))}
                  </span>
                </div>
              </div>

              {/* Nút xác nhận thanh toán */}
              <button 
                type="submit" 
                className="btn-primary-action" 
                disabled={submitting}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', justifyContent: 'center' }}
              >
                <FiCreditCard />
                <span>{submitting ? 'Đang giao dịch...' : 'Xác Nhận Thanh Toán & Gia Hạn'}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
