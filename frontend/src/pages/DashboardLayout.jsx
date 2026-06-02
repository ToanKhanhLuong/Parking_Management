import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";
import { useI18n } from '../context/I18nProvider';
import { 
  FiGrid, FiMonitor, FiTruck, FiBarChart2, FiSettings, FiLogOut, FiPlus, 
  FiSearch, FiGlobe, FiBell, FiHelpCircle, FiChevronDown, FiChevronUp 
} from "react-icons/fi";
import './Dashboard.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const location = useLocation();
  const [vehicleMenuOpen, setVehicleMenuOpen] = useState(true);
  const [configMenuOpen, setConfigMenuOpen] = useState(true);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Helper xác định active class dựa trên đường dẫn hiện tại
  const isActive = (path) => location.pathname === path ? 'active' : '';
  const isSubActive = (paths) => paths.includes(location.pathname) ? 'active' : '';

  return (
    <div className={`dashboard-layout ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">P</div>
              <span>SmartPark Admin</span>
            </div>
          </Link>
          <span className="sidebar-subtitle">{t("Hệ thống quản lý bãi đỗ xe")}</span>
        </div>
        
        <nav className="sidebar-menu">
          <Link to="/dashboard" className={`menu-item ${isActive('/dashboard')}`}>
            <FiGrid className="menu-icon" />
            <span>{t("menu:overview")}</span>
          </Link>
          
          <Link to="/dashboard/monitor" className={`menu-item ${isActive('/dashboard/monitor')}`}>
            <FiMonitor className="menu-icon" />
            <span>{t("menu:monitor")}</span>
          </Link>

          {/* Quản lý xe (Có Submenu) */}
          <div>
            <div 
              className={`menu-item ${isSubActive(['/dashboard/vehicles', '/dashboard/register', '/dashboard/extend'])}`}
              onClick={() => setVehicleMenuOpen(!vehicleMenuOpen)}
              style={{ justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiTruck className="menu-icon" />
                <span>{t("menu:vehicles")}</span>
              </div>
              {vehicleMenuOpen ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            
            {vehicleMenuOpen && (
              <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                <Link to="/dashboard/vehicles" className={`menu-item ${isActive('/dashboard/vehicles')}`} style={{ fontSize: '0.88rem', padding: '8px 16px' }}>
                  <span>{t("menu:vehicles_list")}</span>
                </Link>
                <Link to="/dashboard/register" className={`menu-item ${isActive('/dashboard/register')}`} style={{ fontSize: '0.88rem', padding: '8px 16px' }}>
                  <span>{t("menu:register")}</span>
                </Link>
                <Link to="/dashboard/extend" className={`menu-item ${isActive('/dashboard/extend')}`} style={{ fontSize: '0.88rem', padding: '8px 16px' }}>
                  <span>{t("menu:extend")}</span>
                </Link>
              </div>
            )}
          </div>

          <Link to="/dashboard/reports" className={`menu-item ${isActive('/dashboard/reports')}`}>
            <FiBarChart2 className="menu-icon" />
            <span>{t("menu:reports")}</span>
          </Link>

          {/* Quản lý Thiết bị */}
          <Link to="/dashboard/devices" className={`menu-item ${isActive('/dashboard/devices')}`}>
            <FiMonitor className="menu-icon" />
            <span>{t("menu:devices")}</span>
          </Link>

          {/* Cấu hình hệ thống (Có Submenu) */}
          <div>
            <div 
              className={`menu-item ${isSubActive([
                '/dashboard/config/info', 
                '/dashboard/config/rates', 
                '/dashboard/config/screens', 
                '/dashboard/config/staff', 
                '/dashboard/config/system'
              ])}`}
              onClick={() => setConfigMenuOpen(!configMenuOpen)}
              style={{ justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiSettings className="menu-icon" />
                <span>{t("menu:config")}</span>
              </div>
              {configMenuOpen ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            
            {configMenuOpen && (
              <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                <Link to="/dashboard/config/info" className={`menu-item ${isActive('/dashboard/config/info')}`} style={{ fontSize: '0.88rem', padding: '8px 16px' }}>
                  <span>{t("menu:config_info")}</span>
                </Link>
                <Link to="/dashboard/config/rates" className={`menu-item ${isActive('/dashboard/config/rates')}`} style={{ fontSize: '0.88rem', padding: '8px 16px' }}>
                  <span>{t("menu:config_rates")}</span>
                </Link>
                <Link to="/dashboard/config/screens" className={`menu-item ${isActive('/dashboard/config/screens')}`} style={{ fontSize: '0.88rem', padding: '8px 16px' }}>
                  <span>{t("menu:config_screens")}</span>
                </Link>
                <Link to="/dashboard/config/staff" className={`menu-item ${isActive('/dashboard/config/staff')}`} style={{ fontSize: '0.88rem', padding: '8px 16px' }}>
                  <span>{t("menu:config_staff")}</span>
                </Link>
                <Link to="/dashboard/config/system" className={`menu-item ${isActive('/dashboard/config/system')}`} style={{ fontSize: '0.88rem', padding: '8px 16px' }}>
                  <span>{t("menu:config_system")}</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link to="/dashboard/register" style={{ textDecoration: 'none' }}>
            <button className="btn-report" style={{ width: '100%' }}>
              <FiPlus />
              <span>{t("Đăng ký xe mới")}</span>
            </button>
          </Link>
          <div className="footer-item" style={{ opacity: 0.5 }}>
            <FiSettings className="menu-icon" />
            <span>{t("menu:settings")}</span>
          </div>
          <div className="footer-item" onClick={logout}>
            <FiLogOut className="menu-icon" />
            <span>{t("menu:logout")}</span>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-panel">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Left side empty or branding as needed, since search bar is removed */}
          </div>
          
          <div className="topbar-actions">
            <div className="action-icons" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                style={{
                  background: theme === 'dark' ? '#1e293b' : 'white',
                  border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: theme === 'dark' ? '#f59e0b' : '#64748b',
                  fontSize: '1.2rem',
                  transition: 'all 0.15s ease'
                }}
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                type="button"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Language Selector Dropdown */}
              <div className="language-selector-wrapper" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="lang-select-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: theme === 'dark' ? '#1e293b' : 'white',
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    color: theme === 'dark' ? '#cbd5e1' : '#334155',
                    transition: 'all 0.15s ease'
                  }}
                  type="button"
                >
                  <FiGlobe size={16} color="#2563eb" />
                  <span>{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                  <FiChevronDown size={14} />
                </button>
                
                {langMenuOpen && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      background: theme === 'dark' ? '#1e293b' : 'white',
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: '130px',
                      overflow: 'hidden'
                    }}
                  >
                    <button 
                      onClick={() => { setLang('vi'); setLangMenuOpen(false); }}
                      style={{
                        background: lang === 'vi' ? (theme === 'dark' ? '#334155' : '#eff6ff') : 'none',
                        border: 'none',
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        color: lang === 'vi' ? '#2563eb' : (theme === 'dark' ? '#cbd5e1' : '#334155'),
                        fontWeight: lang === 'vi' ? '600' : 'normal'
                      }}
                      type="button"
                    >
                      Tiếng Việt
                    </button>
                    <button 
                      onClick={() => { setLang('en'); setLangMenuOpen(false); }}
                      style={{
                        background: lang === 'en' ? (theme === 'dark' ? '#334155' : '#eff6ff') : 'none',
                        border: 'none',
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        color: lang === 'en' ? '#2563eb' : (theme === 'dark' ? '#cbd5e1' : '#334155'),
                        fontWeight: lang === 'en' ? '600' : 'normal'
                      }}
                      type="button"
                    >
                      English
                    </button>
                  </div>
                )}
              </div>

              <FiBell className="icon-btn" />
              <FiHelpCircle className="icon-btn" />
            </div>
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.fullname || user?.username || 'Nguyễn Quản Trị'}</span>
                <span className="user-role">{user?.role || 'ADMINISTRATOR'}</span>
              </div>
              <div className="user-avatar">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || 'Admin')}&background=2563eb&color=fff`} alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
