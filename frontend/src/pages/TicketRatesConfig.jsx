// src/pages/TicketRatesConfig.jsx
import React, { useState, useEffect } from 'react';
import { getParkingRatesAPI, updateParkingRatesAPI } from '../services/configService';
import { FiSave, FiCreditCard, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './ConfigPages.css';

export default function TicketRatesConfig() {
  // Car rates
  const [carFirst2Hours, setCarFirst2Hours] = useState(25000);
  const [carNextHour, setCarNextHour] = useState(10000);
  const [carOvernight, setCarOvernight] = useState(100000);
  const [carMonthly, setCarMonthly] = useState(1500000);

  // Motorbike rates
  const [motorbike4Hours, setMotorbike4Hours] = useState(5000);
  const [motorbikeOvernight, setMotorbikeOvernight] = useState(10000);
  const [motorbikeMonthly, setMotorbikeMonthly] = useState(120000);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await getParkingRatesAPI();
        setCarFirst2Hours(Math.round(data.car_first_2_hours));
        setCarNextHour(Math.round(data.car_next_hour));
        setCarOvernight(Math.round(data.car_overnight));
        setCarMonthly(Math.round(data.car_monthly));
        
        setMotorbike4Hours(Math.round(data.motorbike_4_hours));
        setMotorbikeOvernight(Math.round(data.motorbike_overnight));
        setMotorbikeMonthly(Math.round(data.motorbike_monthly));
      } catch (err) {
        setError(err.message || 'Không thể tải cấu hình giá vé.');
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        car_first_2_hours: Number(carFirst2Hours),
        car_next_hour: Number(carNextHour),
        car_overnight: Number(carOvernight),
        car_monthly: Number(carMonthly),
        motorbike_4_hours: Number(motorbike4Hours),
        motorbike_overnight: Number(motorbikeOvernight),
        motorbike_monthly: Number(motorbikeMonthly)
      };
      await updateParkingRatesAPI(payload);
      setSuccess('Cập nhật cấu hình giá vé bãi đỗ xe thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật bảng giá.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="config-container" style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải bảng giá vé...</div>;
  }

  return (
    <div className="config-container">
      <h1 className="config-title">Cấu Hình Giá Vé</h1>

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

      <form onSubmit={handleUpdate}>
        {/* Car Rates Card */}
        <div className="config-card">
          <div className="config-card-header" style={{ borderBottom: '3px solid #2563eb', color: '#2563eb', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCreditCard />
              <span>Ô tô</span>
            </div>
          </div>
          
          <div className="config-grid-2">
            <div className="config-form-group">
              <label className="config-label">2 Giờ Đầu (VNĐ)</label>
              <input 
                type="number" 
                value={carFirst2Hours} 
                onChange={(e) => setCarFirst2Hours(e.target.value)} 
                className="config-input"
                required
              />
            </div>
            <div className="config-form-group">
              <label className="config-label">Mỗi Giờ Sau (VNĐ)</label>
              <input 
                type="number" 
                value={carNextHour} 
                onChange={(e) => setCarNextHour(e.target.value)} 
                className="config-input"
                required
              />
            </div>
          </div>

          <div className="config-grid-2" style={{ marginTop: '10px' }}>
            <div className="config-form-group">
              <label className="config-label">Qua Đêm (VNĐ)</label>
              <input 
                type="number" 
                value={carOvernight} 
                onChange={(e) => setCarOvernight(e.target.value)} 
                className="config-input"
                required
              />
            </div>
            <div className="config-form-group">
              <label className="config-label">Vé Tháng (VNĐ)</label>
              <input 
                type="number" 
                value={carMonthly} 
                onChange={(e) => setCarMonthly(e.target.value)} 
                className="config-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Motorbike Rates Card */}
        <div className="config-card">
          <div className="config-card-header" style={{ borderBottom: '3px solid #475569', color: '#475569', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCreditCard />
              <span>Xe Máy</span>
            </div>
          </div>

          <div className="config-grid-3">
            <div className="config-form-group">
              <label className="config-label">Vé Lượt (4h) (VNĐ)</label>
              <input 
                type="number" 
                value={motorbike4Hours} 
                onChange={(e) => setMotorbike4Hours(e.target.value)} 
                className="config-input"
                required
              />
            </div>
            <div className="config-form-group">
              <label className="config-label">Qua Đêm (VNĐ)</label>
              <input 
                type="number" 
                value={motorbikeOvernight} 
                onChange={(e) => setMotorbikeOvernight(e.target.value)} 
                className="config-input"
                required
              />
            </div>
            <div className="config-form-group">
              <label className="config-label">Vé Tháng (VNĐ)</label>
              <input 
                type="number" 
                value={motorbikeMonthly} 
                onChange={(e) => setMotorbikeMonthly(e.target.value)} 
                className="config-input"
                required
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '12px 24px' }}>
            <FiSave /> {saving ? 'Đang cập nhật...' : 'Cập Nhật'}
          </button>
        </div>
      </form>
    </div>
  );
}
