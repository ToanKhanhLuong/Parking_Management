import React, { useEffect, useState } from 'react';
import { 
  FiBarChart2, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiMaximize, FiPlus, FiTruck
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getDashboardStatsAPI } from '../services/vehicleService';
import { useI18n } from '../context/I18nProvider';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    parkedCount: 0,
    revenueToday: 0,
    arrivalsToday: 0,
    warningsToday: 0,
    recentArrivals: [],
    chartData: []
  });

  const fetchDashboardStats = async () => {
    try {
      const data = await getDashboardStatsAPI();
      setStats(data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    // Tự động reload chỉ số sau mỗi 30 giây để cập nhật thời gian thực
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Xác định nhãn badge và lớp CSS cho các lượt đỗ xe gần đây
  const getBadgeInfo = (cardType) => {
    if (cardType === 'Thẻ VIP') {
      return { text: t('THẺ VIP'), class: 'status-badge valid' };
    }
    if (cardType === 'Vé Tháng') {
      return { text: t('VÉ THÁNG'), class: 'status-badge valid' };
    }
    return { text: t('VÉ LẺ'), class: 'status-badge ticket' };
  };

  // Phần đầu của biển số (ví dụ: "30H-888.99" -> "30H")
  const getPlatePrefix = (plate) => {
    if (!plate) return 'XX';
    const parts = plate.split('-');
    return parts[0] || 'XX';
  };

  const parkedPercentage = Math.min(Math.round((stats.parkedCount / 500) * 100), 100);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div className="page-header">
        <h1 className="page-title">{t("Bảng điều khiển Tổng quan")}</h1>
        <p className="page-subtitle">{t("Theo dõi hoạt động bãi đỗ xe trong thời gian thực")}</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value-container">
            <div>
              <div className="stat-icon blue">
                <FaCar />
              </div>
              <div className="stat-title">{t("Xe trong bãi")}</div>
              <h3 className="stat-value">
                {loading ? '...' : stats.parkedCount}
                <span style={{fontSize: '1rem', color: '#64748b'}}>/500</span>
              </h3>
            </div>
            <div className="stat-trend up"><FiTrendingUp /> {t("Hoạt động")}</div>
          </div>
          <div className="stat-progress">
            <div className="stat-progress-bar" style={{ width: `${loading ? 0 : parkedPercentage}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value-container">
            <div>
              <div className="stat-icon green">
                <FiBarChart2 />
              </div>
              <div className="stat-title">{t("Doanh thu ngày")}</div>
              <h3 className="stat-value" style={{ fontSize: '1.35rem' }}>
                {loading ? '...' : formatCurrency(stats.revenueToday)}
              </h3>
            </div>
            <div className="stat-trend up"><FiTrendingUp /> {t("Hôm nay")}</div>
          </div>
          <div className="stat-footer">{t("Cập nhật: Mới nhất")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-value-container">
            <div>
              <div className="stat-icon purple">
                <FiTruck />
              </div>
              <div className="stat-title">{t("Lượt xe vào")}</div>
              <h3 className="stat-value">
                {loading ? '...' : stats.arrivalsToday}
              </h3>
            </div>
            <div className="stat-trend neutral">{t("Hôm nay")}</div>
          </div>
          <div className="stat-footer">{t("Lượt check-in trong ngày")}</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-value-container">
            <div>
              <div className="stat-icon red">
                <FiAlertTriangle />
              </div>
              <div className="stat-title">{t("Cảnh báo nghi vấn")}</div>
              <h3 className="stat-value">
                {loading ? '...' : stats.warningsToday}
              </h3>
            </div>
          </div>
          <div className="stat-footer" style={{color: stats.warningsToday > 0 ? 'var(--danger)' : '#10b981', fontWeight: 600}}>
            {stats.warningsToday > 0 ? t("Yêu cầu kiểm tra thủ công!") : t("Hệ thống hoạt động tốt")}
          </div>
        </div>
      </div>

      {/* Main Grid for Chart and Lists */}
      <div className="main-grid">
        {/* Chart Area */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">{t("Lưu lượng xe theo giờ")}</h3>
              <p className="chart-subtitle">{t("Dữ liệu từ 06:00 đến 18:00 hôm nay")}</p>
            </div>
            <div className="chart-actions">
              <button className="btn-outline">{t("XUẤT DỮ LIỆU")}</button>
              <button className="btn-outline active">{t("HÔM NAY")}</button>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loading ? [] : stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  labelStyle={{fontWeight: 'bold', color: '#0f172a'}}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Camera Card */}
          <div className="camera-card">
            <div className="camera-header">
              <div className="status-dot"></div>
              {t("LIVE CAM 01 - CỔNG VÀO")}
            </div>
            <div className="camera-footer">
              <div className="plate-badge">
                BKS: {stats.recentArrivals?.[0]?.plate_number || '30G-123.45'}
              </div>
              <FiMaximize className="camera-expand" />
            </div>
          </div>

          {/* Recent List */}
          <div className="list-card">
            <h3 className="list-title">{t("Xe vào gần đây")}</h3>
            <div className="recent-list">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                  {t("Đang tải...")}
                </div>
              ) : stats.recentArrivals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                  {t("Chưa có lượt xe nào hôm nay.")}
                </div>
              ) : (
                stats.recentArrivals.map((item, idx) => {
                  const badge = getBadgeInfo(item.card_type);
                  return (
                    <div className="list-item" key={idx}>
                      <div className="item-info">
                        <div className="plate-prefix">{getPlatePrefix(item.plate_number)}</div>
                        <div>
                          <p className="plate-full" style={{ fontSize: '0.9rem' }}>{item.plate_number}</p>
                          <p className="item-time">{item.time_str}</p>
                        </div>
                      </div>
                      <span className={badge.class}>{badge.text}</span>
                    </div>
                  );
                })
              )}
            </div>
            <button className="btn-view-all" onClick={() => navigate('/dashboard/vehicles')}>{t("Xem tất cả")}</button>
          </div>
        </div>
      </div>
      
      <button className="fab" onClick={() => navigate('/dashboard/register')}>
        <FiPlus />
      </button>
    </div>
  );
}
