import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getVehiclesAPI, deleteVehicleAPI, updateVehicleAPI 
} from '../services/vehicleService';
import { 
  FiSearch, FiEdit2, FiTrash2, FiClock, FiPlus, FiUser, FiPhone, FiCreditCard, FiAlertCircle 
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import './VehiclePages.css';

export default function VehicleList() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Các bộ lọc
  const [search, setSearch] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [cardType, setCardType] = useState('');

  // States phục vụ Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editFormData, setEditFormData] = useState({
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
    status: 'ACTIVE',
    expiry_date: ''
  });
  const [editError, setEditError] = useState('');

  // States phục vụ Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);

  // Tải danh sách xe từ API
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await getVehiclesAPI({ search, vehicleType, cardType });
      setVehicles(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải danh sách phương tiện.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce tìm kiếm một chút hoặc gọi trực tiếp
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, vehicleType, cardType]);

  // Xóa xe
  const handleDelete = async () => {
    if (!deletingVehicleId) return;
    try {
      await deleteVehicleAPI(deletingVehicleId);
      setVehicles(vehicles.filter(v => v.id !== deletingVehicleId));
      setDeleteModalOpen(false);
      setDeletingVehicleId(null);
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa phương tiện.');
    }
  };

  // Mở modal sửa thông tin
  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setEditFormData({
      plate_number: vehicle.plate_number || '',
      representative_name: vehicle.representative_name || '',
      phone: vehicle.phone || '',
      cccd: vehicle.cccd || '',
      address: vehicle.address || '',
      vehicle_type: vehicle.vehicle_type || 'Ô tô',
      card_type: vehicle.card_type || 'Vé Tháng',
      card_code: vehicle.card_code || '',
      brand: vehicle.brand || '',
      color: vehicle.color || '',
      status: vehicle.status || 'ACTIVE',
      expiry_date: vehicle.expiry_date ? vehicle.expiry_date.split('T')[0] : ''
    });
    setEditError('');
    setEditModalOpen(true);
  };

  // Submit cập nhật thông tin
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingVehicle) return;
    try {
      await updateVehicleAPI(editingVehicle.id, editFormData);
      setEditModalOpen(false);
      fetchVehicles(); // Tải lại danh sách
    } catch (err) {
      setEditError(err.message || 'Cập nhật thất bại.');
    }
  };

  // Định dạng ngày hiển thị đẹp
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Xác định badge class cho loại xe
  const getVehicleTypeBadge = (type) => {
    return type === 'Ô tô' ? 'card-monthly' : 'card-vip';
  };

  // Xác định badge class cho hạn dùng
  const getExpiryStatus = (expiryStr, cardType) => {
    if (!expiryStr) return { text: 'Không giới hạn', class: 'status-active' };
    const expiry = new Date(expiryStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (expiry < today) {
      return { text: `Hết hạn (${formatDate(expiryStr)})`, class: 'status-blocked' };
    }
    
    // Sắp hết hạn trong vòng 7 ngày
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return { text: `Sắp hết hạn (${diffDays} ngày)`, class: 'status-lost' };
    }
    
    return { text: formatDate(expiryStr), class: 'status-active' };
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-header-title">Quản Lý Danh Sách Xe</h1>
          <p className="page-subtitle">Quản lý và kiểm tra toàn bộ phương tiện đã đăng ký cố định trong bãi</p>
        </div>
        <button className="btn-primary-action" onClick={() => navigate('/dashboard/register')}>
          <FiPlus />
          <span>Đăng ký mới</span>
        </button>
      </div>

      <div className="glass-card">
        {/* Bộ lọc tìm kiếm */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <FiSearch className="search-input-icon" />
            <input 
              type="text" 
              placeholder="Nhập biển số xe, tên chủ xe hoặc số điện thoại..." 
              className="search-control" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="filter-select" 
            value={vehicleType} 
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="">Tất cả loại xe</option>
            <option value="Ô tô">Ô tô</option>
            <option value="Xe máy">Xe máy</option>
          </select>

          <select 
            className="filter-select" 
            value={cardType} 
            onChange={(e) => setCardType(e.target.value)}
          >
            <option value="">Tất cả loại thẻ</option>
            <option value="Vé Tháng">Vé Tháng</option>
            <option value="Thẻ VIP">Thẻ VIP</option>
          </select>
        </div>

        {/* Bảng danh sách */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Đang tải dữ liệu phương tiện...
          </div>
        ) : error ? (
          <div className="error-banner">
            <FiAlertCircle /> {error}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <FaCar className="empty-state-icon" />
            <p className="empty-state-title">Không tìm thấy phương tiện nào</p>
            <p>Hãy điều chỉnh từ khóa tìm kiếm hoặc tạo một đăng ký xe mới.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Biển Số</th>
                  <th>Chủ Xe</th>
                  <th>SĐT / CCCD</th>
                  <th>Loại Xe</th>
                  <th>Mã Thẻ</th>
                  <th>Loại Thẻ</th>
                  <th>Hết Hạn</th>
                  <th>Trạng Thái Bãi</th>
                  <th style={{ textAlign: 'center' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => {
                  const expiryInfo = getExpiryStatus(v.expiry_date, v.card_type);
                  return (
                    <tr key={v.id}>
                      <td>
                        <span className="plate-tag">{v.plate_number}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{v.representative_name || 'Chưa cập nhật'}</div>
                        {v.brand && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.brand} {v.color ? `(${v.color})` : ''}</div>}
                      </td>
                      <td>
                        <div>{v.phone || '-'}</div>
                        {v.cccd && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CCCD: {v.cccd}</div>}
                      </td>
                      <td>
                        <span className={`badge-pill ${getVehicleTypeBadge(v.vehicle_type)}`}>
                          {v.vehicle_type}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {v.card_code || 'Chưa cấp'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-pill ${v.card_type === 'Thẻ VIP' ? 'status-active' : 'card-monthly'}`}>
                          {v.card_type}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-pill ${expiryInfo.class}`}>
                          {expiryInfo.text}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-pill ${v.session_status === 'Đang đỗ' ? 'park-inside' : 'park-outside'}`}>
                          {v.session_status === 'Đang đỗ' ? 'Trong bãi' : 'Bên ngoài'}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell" style={{ justifyContent: 'center' }}>
                          <button 
                            className="action-icon-btn btn-extend" 
                            title="Gia hạn vé"
                            onClick={() => navigate('/dashboard/extend', { state: { plate_number: v.plate_number } })}
                          >
                            <FiClock />
                          </button>
                          <button 
                            className="action-icon-btn btn-edit" 
                            title="Sửa thông tin"
                            onClick={() => openEditModal(v)}
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            className="action-icon-btn btn-delete" 
                            title="Xóa phương tiện"
                            onClick={() => {
                              setDeletingVehicleId(v.id);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL SỬA THÔNG TIN */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div className="modal-header">
              <h3 className="modal-title">Sửa Thông Tin Phương Tiện</h3>
              <button className="modal-close-btn" onClick={() => setEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {editError && (
                  <div className="error-banner">
                    <FiAlertCircle /> {editError}
                  </div>
                )}

                <div className="form-row-grid">
                  <div className="form-group-col">
                    <label className="form-label form-label-required">Biển Số Xe</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={editFormData.plate_number}
                      onChange={(e) => setEditFormData({ ...editFormData, plate_number: e.target.value })}
                    />
                  </div>
                  <div className="form-group-col">
                    <label className="form-label">Mã Thẻ Từ (RFID)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Quét hoặc nhập mã thẻ"
                      value={editFormData.card_code}
                      onChange={(e) => setEditFormData({ ...editFormData, card_code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-grid">
                  <div className="form-group-col">
                    <label className="form-label form-label-required">Tên Chủ Xe</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={editFormData.representative_name}
                      onChange={(e) => setEditFormData({ ...editFormData, representative_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group-col">
                    <label className="form-label form-label-required">Số Điện Thoại</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-grid">
                  <div className="form-group-col">
                    <label className="form-label">CCCD / CMND</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editFormData.cccd}
                      onChange={(e) => setEditFormData({ ...editFormData, cccd: e.target.value })}
                    />
                  </div>
                  <div className="form-group-col">
                    <label className="form-label">Địa Chỉ</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-grid">
                  <div className="form-group-col">
                    <label className="form-label">Loại Xe</label>
                    <select 
                      className="form-input"
                      value={editFormData.vehicle_type}
                      onChange={(e) => setEditFormData({ ...editFormData, vehicle_type: e.target.value })}
                    >
                      <option value="Ô tô">Ô tô</option>
                      <option value="Xe máy">Xe máy</option>
                    </select>
                  </div>
                  <div className="form-group-col">
                    <label className="form-label">Loại Thẻ</label>
                    <select 
                      className="form-input"
                      value={editFormData.card_type}
                      onChange={(e) => setEditFormData({ ...editFormData, card_type: e.target.value })}
                    >
                      <option value="Vé Tháng">Vé Tháng</option>
                      <option value="Thẻ VIP">Thẻ VIP</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-grid">
                  <div className="form-group-col">
                    <label className="form-label">Hãng Xe (Hiệu)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="E.g. Toyota, Honda"
                      value={editFormData.brand}
                      onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                    />
                  </div>
                  <div className="form-group-col">
                    <label className="form-label">Màu Xe</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="E.g. Đỏ, Trắng, Đen"
                      value={editFormData.color}
                      onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-grid">
                  <div className="form-group-col">
                    <label className="form-label">Ngày Hết Hạn</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={editFormData.expiry_date}
                      onChange={(e) => setEditFormData({ ...editFormData, expiry_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group-col">
                    <label className="form-label">Trạng Thái Thẻ</label>
                    <select 
                      className="form-input"
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    >
                      <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                      <option value="INACTIVE">Khóa tạm thời (INACTIVE)</option>
                      <option value="BLOCKED">Bị chặn (BLOCKED)</option>
                      <option value="LOST">Báo mất thẻ (LOST)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-primary-form">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-window" style={{ maxWidth: '400px' }}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <h3 className="modal-title">Xác Nhận Xóa</h3>
              <button className="modal-close-btn" onClick={() => setDeleteModalOpen(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '0 24px 20px 24px', textAlign: 'center' }}>
              <FiAlertCircle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>Bạn có chắc muốn xóa phương tiện này?</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '8px' }}>
                Hành động này không thể hoàn tác. Dữ liệu đăng ký xe sẽ bị gỡ bỏ vĩnh viễn khỏi bãi xe.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', backgroundColor: '#ffffff' }}>
              <button className="btn-secondary" onClick={() => setDeleteModalOpen(false)}>Không, giữ lại</button>
              <button className="btn-danger-form" onClick={handleDelete}>Vâng, đồng ý xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
