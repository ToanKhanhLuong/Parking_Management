// src/pages/SystemSettings.jsx
import React, { useState, useEffect } from 'react';
import { 
  getSystemSettingsAPI, 
  updateSystemSettingsAPI, 
  backupSystemAPI, 
  rebootSystemAPI 
} from '../services/configService';
import { 
  FiSettings, FiShield, FiDatabase, FiRefreshCw, 
  FiCheckCircle, FiAlertCircle, FiAlertTriangle 
} from 'react-icons/fi';
import './ConfigPages.css';

export default function SystemSettings() {
  const [qrActive, setQrActive] = useState(true);
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Backup / Reboot action states
  const [backupLog, setBackupLog] = useState('');
  const [rebootLog, setRebootLog] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSystemSettingsAPI();
        setQrActive(data.qr_active);
        setMaintenanceActive(data.maintenance_active);
      } catch (err) {
        setError(err.message || 'Không thể tải thiết lập hệ thống.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async (type, val) => {
    setUpdating(true);
    setError('');
    setSuccess('');
    
    // Optimistic state
    let newQr = qrActive;
    let newMaint = maintenanceActive;
    
    if (type === 'qr') {
      newQr = val;
      setQrActive(val);
    } else if (type === 'maintenance') {
      newMaint = val;
      setMaintenanceActive(val);
    }

    try {
      await updateSystemSettingsAPI({
        qr_active: newQr,
        maintenance_active: newMaint
      });
      setSuccess('Cập nhật trạng thái hệ thống thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật thiết lập.');
      // Revert state on error
      if (type === 'qr') setQrActive(!val);
      else if (type === 'maintenance') setMaintenanceActive(!val);
    } finally {
      setUpdating(false);
    }
  };

  const handleBackup = async () => {
    setBackupLog('Đang tạo bản sao lưu dữ liệu...');
    setError('');
    try {
      const data = await backupSystemAPI();
      setBackupLog(data.message);
    } catch (err) {
      setError(err.message || 'Sao lưu hệ thống thất bại!');
      setBackupLog('');
    }
  };

  const handleReboot = async () => {
    if (!window.confirm('Cảnh báo: Bạn đang yêu cầu khởi động lại hệ thống máy chủ bãi xe. Mọi phiên giám sát camera có thể gián đoạn tạm thời. Xác nhận tiếp tục?')) return;
    setRebootLog('Gửi lệnh khởi động lại...');
    setError('');
    try {
      const data = await rebootSystemAPI();
      setRebootLog(data.message);
    } catch (err) {
      setError(err.message || 'Yêu cầu khởi động lại thất bại!');
      setRebootLog('');
    }
  };

  if (loading) {
    return <div className="config-container" style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải thiết lập hệ thống...</div>;
  }

  return (
    <div className="config-container">
      <h1 className="config-title">Thiết Lập Hệ Thống</h1>

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

      <div className="config-card">
        <div className="config-card-header card-header-blue">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiSettings color="#2563eb" />
            <span>Kích Hoạt Chức Năng</span>
          </div>
        </div>

        {/* QR Scanner Switch */}
        <div className="switch-group">
          <div className="switch-label-block">
            <span className="switch-title">Kích hoạt Quét QR Code</span>
            <span className="switch-desc">Cho phép các làn vào/ra sử dụng máy quét mã QR để đối soát và thanh toán nhanh.</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={qrActive} 
              onChange={(e) => handleToggle('qr', e.target.checked)} 
              disabled={updating}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Maintenance Switch */}
        <div className="switch-group">
          <div className="switch-label-block">
            <span className="switch-title">Chế độ Bảo Trì Hệ Thống</span>
            <span className="switch-desc">Khóa toàn bộ cổng điều khiển và hiển thị màn hình thông báo bảo trì lên tất cả máy trạm lối vào/ra.</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={maintenanceActive} 
              onChange={(e) => handleToggle('maintenance', e.target.checked)} 
              disabled={updating}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="config-grid-2">
        {/* Backup Card */}
        <div className="config-card" style={{ height: 'fit-content' }}>
          <div className="config-card-header" style={{ borderBottom: '3px solid #d97706', color: '#d97706', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiDatabase />
              <span>Sao Lưu Dữ Liệu</span>
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
            Xuất toàn bộ cơ sở dữ liệu hiện tại của hệ thống bao gồm: thông tin xe đăng ký, phiên đỗ xe, và doanh thu thanh toán thành tệp tin SQL để dự phòng.
          </p>
          
          {backupLog && (
            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', color: '#b45309', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '14px', fontFamily: 'monospace' }}>
              {backupLog}
            </div>
          )}

          <button onClick={handleBackup} className="btn-warning" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiDatabase /> Sao Lưu
          </button>
        </div>

        {/* Reboot Card */}
        <div className="config-card" style={{ height: 'fit-content' }}>
          <div className="config-card-header" style={{ borderBottom: '3px solid #dc2626', color: '#dc2626', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiRefreshCw />
              <span>Khởi Động Lại</span>
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
            Khởi động lại toàn bộ dịch vụ server API điều hành bãi đỗ xe và các tiến trình camera nhận dạng AI. Vui lòng cân nhắc trước khi ấn.
          </p>

          {rebootLog && (
            <div style={{ background: '#fec2c2', border: '1px solid #ef4444', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '14px', fontFamily: 'monospace' }}>
              <FiAlertTriangle style={{ marginRight: '6px' }} />
              {rebootLog}
            </div>
          )}

          <button onClick={handleReboot} className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiRefreshCw /> Khởi Động Lại
          </button>
        </div>
      </div>
    </div>
  );
}
