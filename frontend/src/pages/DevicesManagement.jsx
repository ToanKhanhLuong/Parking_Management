// src/pages/DevicesManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  getDevicesAPI, 
  createDeviceAPI, 
  updateDeviceAPI, 
  deleteDeviceAPI 
} from '../services/configService';
import { 
  FiCpu, FiCamera, FiTv, FiRadio, FiPlus, FiEdit2, 
  FiTrash2, FiRefreshCw, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';
import './ConfigPages.css';

export default function DevicesManagement() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null); // null if Add, object if Edit
  
  // Form states
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('camera');
  const [gate, setGate] = useState('Làn Vào');
  const [ipAddress, setIpAddress] = useState('');
  const [status, setStatus] = useState('offline');

  const fetchDevices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDevicesAPI();
      setDevices(data);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách thiết bị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const openAddModal = () => {
    setCurrentDevice(null);
    setDeviceName('');
    setDeviceType('camera');
    setGate('Làn Vào');
    setIpAddress('');
    setStatus('offline');
    setModalOpen(true);
  };

  const openEditModal = (dev) => {
    setCurrentDevice(dev);
    setDeviceName(dev.device_name);
    setDeviceType(dev.device_type);
    setGate(dev.gate);
    setIpAddress(dev.ip_address);
    setStatus(dev.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!deviceName.trim()) {
      setError('Tên thiết bị không được để trống!');
      return;
    }

    const payload = {
      device_name: deviceName,
      device_type: deviceType,
      gate,
      ip_address: ipAddress,
      status
    };

    try {
      if (currentDevice) {
        // Edit mode
        await updateDeviceAPI(currentDevice.id, payload);
        setSuccess('Cập nhật thiết bị thành công!');
      } else {
        // Add mode
        await createDeviceAPI(payload);
        setSuccess('Thêm thiết bị mới thành công!');
      }
      setModalOpen(false);
      fetchDevices();
      
      // Clear alert after 3s
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Thao tác thiết bị thất bại!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này không?')) return;
    setError('');
    setSuccess('');
    try {
      await deleteDeviceAPI(id);
      setSuccess('Xóa thiết bị thành công!');
      fetchDevices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Xóa thiết bị thất bại!');
    }
  };

  // Helper sinh icon cho loại thiết bị
  const renderDeviceIcon = (type) => {
    switch (type) {
      case 'camera':
        return <FiCamera size={22} color="#2563eb" />;
      case 'barrier':
        return <FiCpu size={22} color="#10b981" />;
      case 'led':
        return <FiTv size={22} color="#d97706" />;
      case 'sensor':
        return <FiRadio size={22} color="#ef4444" />;
      default:
        return <FiCpu size={22} color="#64748b" />;
    }
  };

  return (
    <div className="config-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="config-title" style={{ margin: 0 }}>Quản Lý Thiết Bị Phần Cứng</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchDevices} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
            <FiRefreshCw /> Làm mới
          </button>
          <button onClick={openAddModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
            <FiPlus /> Thêm thiết bị
          </button>
        </div>
      </div>

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Đang tải danh sách thiết bị...</div>
      ) : devices.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#64748b' }}>
          Chưa có thiết bị nào được thiết lập. Hãy bấm nút "Thêm thiết bị" để bắt đầu!
        </div>
      ) : (
        <div className="devices-grid">
          {devices.map((dev) => (
            <div key={dev.id} className="device-card">
              <div>
                <div className="device-badge-row">
                  <span className={`badge-role badge-${dev.device_type === 'camera' ? 'admin' : dev.device_type === 'barrier' ? 'security' : 'accountant'}`} style={{ textTransform: 'uppercase' }}>
                    {dev.device_type}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={`device-indicator status-${dev.status}`}></span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'capitalize' }}>
                      {dev.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px' }}>
                  <div style={{ background: '#f1f5f9', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifycontent: 'center', paddingLeft: '10px' }}>
                    {renderDeviceIcon(dev.device_type)}
                  </div>
                  <div>
                    <h3 className="device-title" style={{ margin: 0 }}>{dev.device_name}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Cổng: {dev.gate}</span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span className="device-ip">{dev.ip_address || 'Không có IP'}</span>
                  <div className="device-actions">
                    <button onClick={() => openEditModal(dev)} className="action-btn-circle action-btn-edit" title="Chỉnh sửa">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(dev.id)} className="action-btn-circle action-btn-delete" title="Xóa thiết bị">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>{currentDevice ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}</span>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="config-form-group">
                <label className="config-label">Tên thiết bị *</label>
                <input 
                  type="text" 
                  value={deviceName} 
                  onChange={(e) => setDeviceName(e.target.value)} 
                  placeholder="Ví dụ: Camera ngõ vào 01" 
                  className="config-input"
                  required 
                />
              </div>

              <div className="config-grid-2">
                <div className="config-form-group">
                  <label className="config-label">Loại thiết bị</label>
                  <select 
                    value={deviceType} 
                    onChange={(e) => setDeviceType(e.target.value)} 
                    className="config-select"
                  >
                    <option value="camera">Camera nhận diện</option>
                    <option value="barrier">Cổng Barrier</option>
                    <option value="led">Bảng LED hiển thị</option>
                    <option value="sensor">Cảm biến hồng ngoại</option>
                  </select>
                </div>

                <div className="config-form-group">
                  <label className="config-label">Làn điều khiển</label>
                  <select 
                    value={gate} 
                    onChange={(e) => setGate(e.target.value)} 
                    className="config-select"
                  >
                    <option value="Làn Vào">Làn Vào</option>
                    <option value="Làn Ra">Làn Ra</option>
                    <option value="Khác">Khác / Toàn khu</option>
                  </select>
                </div>
              </div>

              <div className="config-grid-2">
                <div className="config-form-group">
                  <label className="config-label">Địa chỉ IP thiết bị</label>
                  <input 
                    type="text" 
                    value={ipAddress} 
                    onChange={(e) => setIpAddress(e.target.value)} 
                    placeholder="192.168.1.50" 
                    className="config-input" 
                  />
                </div>

                <div className="config-form-group">
                  <label className="config-label">Trạng thái kết nối</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="config-select"
                  >
                    <option value="online">Online (Đang hoạt động)</option>
                    <option value="offline">Offline (Chờ kết nối)</option>
                    <option value="error">Error (Báo lỗi)</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Hủy bỏ</button>
                <button type="submit" className="btn-primary">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
