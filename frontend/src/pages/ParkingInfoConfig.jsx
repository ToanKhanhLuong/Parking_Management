// src/pages/ParkingInfoConfig.jsx
import React, { useState, useEffect } from 'react';
import { getParkingInfoAPI, updateParkingInfoAPI } from '../services/configService';
import { FiSave, FiInfo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './ConfigPages.css';

export default function ParkingInfoConfig() {
  const [parkName, setParkName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState(500);
  const [currency, setCurrency] = useState('VNĐ');
  const [ledMessage, setLedMessage] = useState('XIN CHAO - WELCOME');
  const [logo, setLogo] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await getParkingInfoAPI();
        setParkName(data.park_name);
        setAddress(data.address);
        setCapacity(data.capacity);
        setCurrency(data.currency);
        setLedMessage(data.led_message);
        setLogo(data.logo);
      } catch (err) {
        setError(err.message || 'Không thể tải thông tin bãi xe.');
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        park_name: parkName,
        address,
        capacity: Number(capacity),
        currency,
        led_message: ledMessage,
        logo
      };
      await updateParkingInfoAPI(payload);
      setSuccess('Lưu cấu hình thông tin bãi đỗ xe thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  const simulateLogoChoose = () => {
    // Mô phỏng việc chọn tệp và đặt tệp ngẫu nhiên
    setLogo('/uploads/logo_main.png');
    alert('Đã giả lập tải lên Logo bãi đỗ xe: /uploads/logo_main.png');
  };

  if (loading) {
    return <div className="config-container" style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải cấu hình thông tin bãi xe...</div>;
  }

  return (
    <div className="config-container">
      <h1 className="config-title">Thông Tin Bãi Xe</h1>

      {success && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCheckCircle /> <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiAlertCircle /> <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="config-card">
        <div className="config-card-header card-header-blue">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiInfo color="#2563eb" />
            <span>Thiết Lập Cơ Bản</span>
          </div>
        </div>

        {/* Logo / Avatar uploader */}
        <div className="config-form-group">
          <label className="config-label">Logo Website / Avatar</label>
          <div className="avatar-uploader-container">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="preview-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#475569', fontWeight: 'bold', fontSize: '1.25rem', overflow: 'hidden' }}>
                {logo ? (
                  <img src="https://images.unsplash.com/photo-1549813069-f95e44d7f498?auto=format&fit=crop&w=80&q=80" alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : 'Logo'}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={simulateLogoChoose} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  Choose File
                </button>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  {logo ? logo.split('/').pop() : 'No file chosen'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Chọn ảnh vuông (.png, .jpg).</p>
            </div>
          </div>
        </div>

        <div className="config-grid-2">
          <div className="config-form-group">
            <label className="config-label">Tên Bãi Xe</label>
            <input 
              type="text" 
              value={parkName} 
              onChange={(e) => setParkName(e.target.value)} 
              className="config-input" 
              placeholder="Nhập tên bãi đỗ xe"
              required 
            />
          </div>

          <div className="config-form-group">
            <label className="config-label">Địa Chỉ</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              className="config-input" 
              placeholder="Địa chỉ vật lý của bãi đỗ"
              required 
            />
          </div>
        </div>

        <div className="config-grid-3">
          <div className="config-form-group">
            <label className="config-label">Tổng Sức Chứa</label>
            <input 
              type="number" 
              value={capacity} 
              onChange={(e) => setCapacity(e.target.value)} 
              className="config-input" 
              placeholder="Tổng số ô đỗ"
              required 
            />
          </div>

          <div className="config-form-group">
            <label className="config-label">Tiền Tệ</label>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)} 
              className="config-select"
            >
              <option value="VNĐ">VNĐ (Đồng Việt Nam)</option>
              <option value="USD">USD (Đô la Mỹ)</option>
              <option value="EUR">EUR (Euro)</option>
            </select>
          </div>

          <div className="config-form-group">
            <label className="config-label">Màn hình LED cổng chào</label>
            <input 
              type="text" 
              value={ledMessage} 
              onChange={(e) => setLedMessage(e.target.value)} 
              className="config-input" 
              placeholder="Lời chào hiển thị bảng LED"
              required 
            />
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <button type="submit" disabled={saving} className="btn-primary">
            <FiSave /> {saving ? 'Đang lưu...' : 'Lưu Thông Tin'}
          </button>
        </div>
      </form>
    </div>
  );
}
