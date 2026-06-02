// src/pages/StaffManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  getStaffAPI, 
  createStaffAPI, 
  updateStaffAPI, 
  deleteStaffAPI 
} from '../services/configService';
import { useAuth } from '../hooks/useAuth';
import { 
  FiUserPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, 
  FiRefreshCw, FiCheckCircle, FiAlertCircle, FiShield 
} from 'react-icons/fi';
import './ConfigPages.css';

export default function StaffManagement() {
  const { user: currentUser } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Password visible lists
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null); // null if Add, object if Edit

  // Form states
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Security');
  const [status, setStatus] = useState('ACTIVE');

  const fetchStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStaffAPI();
      setStaffList(data);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAddModal = () => {
    setSelectedStaff(null);
    setUsername('');
    setFullname('');
    setPassword('');
    setRole('Security');
    setStatus('ACTIVE');
    setModalOpen(true);
  };

  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setUsername(staff.username);
    setFullname(staff.fullname);
    setPassword(''); // Mật khẩu để trống, nếu điền mới đổi
    setRole(staff.role);
    setStatus(staff.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedStaff && (!username.trim() || !password.trim())) {
      setError('Vui lòng điền tên đăng nhập và mật khẩu khi thêm mới!');
      return;
    }

    if (!fullname.trim()) {
      setError('Họ và tên không được để trống!');
      return;
    }

    const payload = {
      fullname,
      role,
      status,
      password: password.trim() !== '' ? password : undefined
    };

    try {
      if (selectedStaff) {
        // Edit mode
        await updateStaffAPI(selectedStaff.id, payload);
        setSuccess('Cập nhật thông tin nhân viên thành công!');
      } else {
        // Add mode
        await createStaffAPI({
          username,
          fullname,
          password,
          role,
          status
        });
        setSuccess('Thêm nhân viên mới thành công!');
      }
      setModalOpen(false);
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Thao tác tài khoản nhân viên thất bại!');
    }
  };

  const handleDelete = async (id) => {
    if (Number(id) === 1) {
      alert('Tài khoản Admin gốc được hệ thống bảo vệ. Không thể xóa!');
      return;
    }

    if (currentUser && Number(id) === currentUser.id) {
      alert('Bạn không thể xóa tài khoản của chính mình khi đang đăng nhập!');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống không?')) return;
    
    setError('');
    setSuccess('');
    try {
      await deleteStaffAPI(id);
      setSuccess('Xóa nhân viên thành công!');
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Xóa nhân viên thất bại!');
    }
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="config-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="config-title" style={{ margin: 0 }}>Tài Khoản Nhân Viên</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchStaff} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
            <FiRefreshCw /> Làm mới
          </button>
          <button onClick={openAddModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
            <FiUserPlus /> + Thêm NV
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

      <div className="config-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#0f172a' }}>
          Danh Sách Tài Khoản
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Đang tải danh sách nhân viên...</div>
        ) : staffList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Chưa có tài khoản nhân viên nào.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', width: '80px' }}>ID</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>User</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Họ Tên</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', width: '180px' }}>Mật Khẩu</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Role</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Trạng Thái</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', width: '120px', textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} className="staff-row-hover">
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: '#64748b' }}>{staff.id}</td>
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{staff.username}</td>
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: '#334155' }}>{staff.fullname}</td>
                    
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>
                          {visiblePasswords[staff.id] ? '••••••••' : '••••••••'}
                        </span>
                        <button 
                          onClick={() => togglePasswordVisibility(staff.id)}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Hiển thị mật khẩu"
                          disabled
                        >
                          <FiEyeOff size={14} />
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge-role badge-${staff.role.toLowerCase()}`}>
                        {staff.role}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge-status badge-${staff.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {staff.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => openEditModal(staff)} className="action-btn-circle action-btn-edit" title="Chỉnh sửa">
                        <FiEdit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(staff.id)} 
                        className="action-btn-circle action-btn-delete" 
                        title="Xóa tài khoản"
                        style={{ opacity: staff.id === 1 ? 0.3 : 1, cursor: staff.id === 1 ? 'not-allowed' : 'pointer' }}
                        disabled={staff.id === 1}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>{selectedStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân sự mới'}</span>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="config-form-group">
                <label className="config-label">Tên đăng nhập (Username) *</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="config-input" 
                  placeholder="Ví dụ: security02"
                  disabled={!!selectedStaff}
                  required
                />
              </div>

              <div className="config-form-group">
                <label className="config-label">Họ và tên nhân viên *</label>
                <input 
                  type="text" 
                  value={fullname} 
                  onChange={(e) => setFullname(e.target.value)} 
                  className="config-input" 
                  placeholder="Nhập họ và tên đầy đủ"
                  required
                />
              </div>

              <div className="config-form-group">
                <label className="config-label">
                  {selectedStaff ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu *'}
                </label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="config-input" 
                  placeholder={selectedStaff ? '••••••••' : 'Nhập mật khẩu'}
                  required={!selectedStaff}
                />
              </div>

              <div className="config-grid-2">
                <div className="config-form-group">
                  <label className="config-label">Quyền hạn (Role)</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    className="config-select"
                    disabled={selectedStaff && selectedStaff.id === 1}
                  >
                    <option value="Admin">Admin (Quản trị viên)</option>
                    <option value="Security">Security (Bảo vệ)</option>
                    <option value="Accountant">Accountant (Kế toán)</option>
                  </select>
                </div>

                <div className="config-form-group">
                  <label className="config-label">Trạng thái hoạt động</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="config-select"
                    disabled={selectedStaff && selectedStaff.id === 1}
                  >
                    <option value="ACTIVE">Hoạt động (Active)</option>
                    <option value="INACTIVE">Khóa tài khoản (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Hủy bỏ</button>
                <button type="submit" className="btn-primary">Lưu nhân sự</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
