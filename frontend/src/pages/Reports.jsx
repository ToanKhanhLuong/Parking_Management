import React, { useEffect, useState } from 'react';
import { 
  getRevenueReportAPI, getParkingLogsAPI, getAlertLogsAPI 
} from '../services/vehicleService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  FiBarChart2, FiActivity, FiAlertTriangle, FiSearch, FiCalendar, FiClock, 
  FiExternalLink, FiHelpCircle, FiArrowRight, FiCheckCircle 
} from 'react-icons/fi';
import { FaCar, FaMotorcycle } from 'react-icons/fa';
import './VehiclePages.css';
import './Reports.css';

const RADIAN = Math.PI / 180;
const PIE_COLORS = ['#2563eb', '#10b981']; // Modern Blue for Ô tô, Modern Green for Xe máy

export default function Reports() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Dữ liệu Báo cáo Doanh thu
  const [revenueData, setRevenueData] = useState({
    weeklyRevenue: [],
    vehicleRatio: [],
    dailyDetails: []
  });

  // 2. Dữ liệu Nhật ký Ra Vào
  const [parkingLogs, setParkingLogs] = useState([]);
  const [logsSearch, setLogsSearch] = useState('');

  // 3. Dữ liệu Nhật ký Cảnh báo
  const [alertLogs, setAlertLogs] = useState([]);

  // Fetch dữ liệu dựa theo tab đang active
  const loadTabData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'revenue') {
        const data = await getRevenueReportAPI();
        setRevenueData(data);
      } else if (activeTab === 'logs') {
        const data = await getParkingLogsAPI(logsSearch);
        setParkingLogs(data);
      } else if (activeTab === 'alerts') {
        const data = await getAlertLogsAPI();
        setAlertLogs(data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải dữ liệu báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  // Gọi lại API logs khi người dùng gõ tìm kiếm (có debouncing nhỏ)
  useEffect(() => {
    if (activeTab !== 'logs') return;
    const timer = setTimeout(() => {
      loadTabData();
    }, 400);
    return () => clearTimeout(timer);
  }, [logsSearch]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="page-container" style={{ padding: '8px 0' }}>
      <div className="page-header-row" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-header-title">Báo Cáo & Thống Kê Doanh Thu</h1>
          <p className="page-subtitle">Xem báo cáo doanh thu tuần, phân tích lượt xe ra vào và kiểm tra cảnh báo</p>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="reports-tabs-bar">
        <button 
          className={`reports-tab-btn ${activeTab === 'revenue' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          <FiBarChart2 className="menu-icon" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          <span>Tổng Hợp Doanh Thu</span>
        </button>
        <button 
          className={`reports-tab-btn ${activeTab === 'logs' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <FiActivity className="menu-icon" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          <span>Nhật Ký Ra Vào (Logs)</span>
        </button>
        <button 
          className={`reports-tab-btn ${activeTab === 'alerts' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <FiAlertTriangle className="menu-icon" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          <span>Lịch Sử Cảnh Báo</span>
          {alertLogs.length > 0 && activeTab !== 'alerts' && (
            <span className="tab-badge" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>
              {alertLogs.length}
            </span>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="error-banner" style={{ marginBottom: '24px' }}>
          <FiAlertTriangle /> {error}
        </div>
      )}

      {/* ========================================================
          TAB 1: TỔNG HỢP DOANH THU 
          ======================================================== */}
      {activeTab === 'revenue' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
              Đang tổng hợp dữ liệu doanh thu bãi đỗ xe...
            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              
              {/* Grid 2 cột cho Biểu đồ cột Tuần và Biểu đồ tròn Tỷ lệ */}
              <div className="reports-charts-grid">
                
                {/* A. Biểu đồ doanh thu tuần */}
                <div className="glass-card" style={{ margin: 0 }}>
                  <div className="chart-header-row">
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700 }}>Biểu Đồ Doanh Thu Tuần</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Đơn vị hiển thị: Triệu VNĐ
                      </p>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={revenueData.weeklyRevenue} 
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value) => [`${value.toFixed(2)} Triệu VNĐ`, 'Doanh Thu']}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* B. Biểu đồ tỷ lệ phương tiện */}
                <div className="glass-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Tỷ Lệ Phương Tiện</h4>
                  <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: '160px', height: '160px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={revenueData.vehicleRatio}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {revenueData.vehicleRatio.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} lượt`, 'Số lượng']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="doughnut-legend-container">
                      {revenueData.vehicleRatio.map((item, idx) => (
                        <div className="legend-item-row" key={idx}>
                          <div className="legend-color-dot" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                          <span>
                            {item.name}: <b>{item.value} lượt</b>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* C. Bảng chi tiết doanh thu theo ngày */}
              <div className="glass-card" style={{ margin: 0 }}>
                <h4 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Chi Tiết Doanh Thu</h4>
                
                {revenueData.dailyDetails.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    Chưa phát sinh giao dịch thanh toán nào được ghi nhận.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Ngày</th>
                          <th>Vé Lượt (Casual Ticket)</th>
                          <th>Vé Tháng (Subscription Fee)</th>
                          <th style={{ textAlign: 'right' }}>Tổng Thu (VND)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueData.dailyDetails.map((row, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiCalendar color="var(--primary)" /> {row.date_str}
                              </span>
                            </td>
                            <td>{formatCurrency(row.casual_rev)}</td>
                            <td>{formatCurrency(row.monthly_rev)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)', fontSize: '0.98rem' }}>
                              {formatCurrency(row.total_rev)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: NHẬT KÝ RA VÀO (LOGS)
          ======================================================== */}
      {activeTab === 'logs' && (
        <div className="glass-card" style={{ margin: 0, animation: 'fadeIn 0.3s ease-out' }}>
          <div className="chart-header-row" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Nhật Ký Xe Ra Vào Bãi</h4>
            
            <div className="search-input-wrapper" style={{ maxWidth: '300px', minWidth: '240px' }}>
              <FiSearch className="search-input-icon" />
              <input 
                type="text" 
                placeholder="Nhập biển số xe lọc nhật ký..." 
                className="search-control" 
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Đang truy vấn nhật ký bãi đỗ xe...
            </div>
          ) : parkingLogs.length === 0 ? (
            <div className="empty-state">
              <FiActivity className="empty-state-icon" />
              <p className="empty-state-title">Chưa có lượt xe ra vào nào khớp</p>
              <p>Hệ thống ghi nhận check-in/out trống hoặc biển số xe không khớp.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Biển Số Xe</th>
                    <th>Loại Xe</th>
                    <th>Thời Gian Vào</th>
                    <th>Thời Gian Ra</th>
                    <th>Loại Vé</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {parkingLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className="plate-tag">{log.plate_number}</span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                          {log.vehicle_type === 'Ô tô' ? <FaCar color="#2563eb" /> : <FaMotorcycle color="#10b981" />}
                          {log.vehicle_type}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                          <FiClock color="var(--primary)" /> {log.time_in_str}
                        </span>
                      </td>
                      <td>
                        {log.time_out_str ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                            <FiArrowRight color="var(--success)" /> {log.time_out_str}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.82rem' }}>
                            Đang đỗ (chưa ra)
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge-pill ${log.card_type === 'Thẻ VIP' ? 'status-active' : log.card_type === 'Vé Tháng' ? 'card-monthly' : 'status-inactive'}`}>
                          {log.card_type || 'Vé Lẻ'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-pill ${log.status === 'Đang đỗ' ? 'park-inside' : log.status === 'Đã ra' ? 'status-inactive' : 'status-blocked'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: LỊCH SỬ CẢNH BÁO
          ======================================================== */}
      {activeTab === 'alerts' && (
        <div className="glass-card" style={{ margin: 0, animation: 'fadeIn 0.3s ease-out' }}>
          <h4 style={{ margin: '0 0 20px 0', fontWeight: 700 }}>Lịch Sử Cảnh Báo Hệ Thống</h4>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Đang tải nhật ký cảnh báo từ bãi xe...
            </div>
          ) : alertLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 0' }}>
              <FiCheckCircle className="empty-state-icon" style={{ color: '#10b981' }} />
              <p className="empty-state-title" style={{ color: '#10b981' }}>Không phát hiện cảnh báo nào</p>
              <p>Hệ thống AI nhận diện biển số và kiểm tra bảo mật bãi đỗ hoạt động hoàn hảo!</p>
            </div>
          ) : (
            <div className="alert-cards-container">
              {alertLogs.map((alert) => (
                <div className="alert-item-card audit-warn" key={alert.id}>
                  <div className="alert-card-left">
                    {/* Ảnh camera biển số AI (nếu có, không thì hiển thị placeholder) */}
                    <img 
                      src={alert.plate_image_url || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=200&auto=format&fit=crop"} 
                      alt="License camera" 
                      className="alert-image-thumb"
                      onClick={() => window.open(alert.plate_image_url || "#")}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=200&auto=format&fit=crop";
                      }}
                    />
                    
                    <div className="alert-card-info">
                      <div className="alert-card-msg">{alert.message || 'Cảnh báo nhận diện phương tiện nghi vấn'}</div>
                      <div className="alert-card-meta">
                        <span>Biển số đọc: <b className="plate-tag" style={{ padding: '2px 8px', fontSize: '0.8rem', fontFamily: 'monospace' }}>{alert.detected_plate}</b></span>
                        <span>Loại xe: <b>{alert.detected_vehicle_type}</b></span>
                        <span>Cổng: <b>{alert.gate}</b></span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{alert.time_str}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="alert-confidence-badge" title="Độ tin cậy của thuật toán AI">
                      Độ tin cậy: {alert.plate_confidence ? `${alert.plate_confidence}%` : 'Chưa định lượng'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
