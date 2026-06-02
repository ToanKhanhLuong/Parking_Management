// src/pages/Monitor.jsx
import React, { useState, useEffect } from 'react';
import { openBarrierAPI, getBarrierScreensAPI } from '../services/configService';
import { FiMonitor, FiVideo, FiCheckCircle, FiAlertCircle, FiActivity } from 'react-icons/fi';
import { useI18n } from '../context/I18nProvider';
import './ConfigPages.css';

export default function Monitor() {
  const { t } = useI18n();
  const [screenInVideo, setScreenInVideo] = useState('');
  const [screenOutVideo, setScreenOutVideo] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Tải cấu hình video thực tế từ bãi xe để hiển thị luồng live
  useEffect(() => {
    const fetchScreens = async () => {
      try {
        const data = await getBarrierScreensAPI();
        setScreenInVideo(data.screen_in_video || '');
        setScreenOutVideo(data.screen_out_video || '');
      } catch (err) {
        console.error('Không thể lấy luồng video bãi xe, sử dụng nguồn dự phòng.');
      } finally {
        setLoading(false);
      }
    };
    fetchScreens();
  }, []);

  const handleOpenBarrier = async (gate) => {
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await openBarrierAPI(gate);
      setSuccessMessage(res.message);
      
      // Clear alert after 4 seconds
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || t("Mở Barie thất bại!"));
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  return (
    <div className="config-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 className="config-title" style={{ margin: 0 }}>{t("Hệ Thống Giám Sát Camera & Điều Khiển")}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
          <FiActivity className="pulsate-active" />
          <span>Real-time Live Stream Active</span>
        </div>
      </div>

      {successMessage && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideInDown 0.3s ease' }}>
          <FiCheckCircle size={18} /> <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideInDown 0.3s ease' }}>
          <FiAlertCircle size={18} /> <span>{errorMessage}</span>
        </div>
      )}

      <div className="config-grid-2">
        {/* Làn Vào */}
        <div className="config-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2563eb', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t("Làn Vào")}</span>
            <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#2563eb', padding: '2px 8px', borderRadius: '4px' }}>CAM-01 ACTIVE</span>
          </div>

          <div style={{ width: '100%', height: '360px', background: '#090d16', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            {screenInVideo ? (
              <video 
                src={screenInVideo} 
                autoPlay 
                loop 
                muted 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setScreenInVideo('')}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                <FiVideo size={48} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>CAM-01 LIVE</span>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(15,23,42,0.75)', color: 'white', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-dot-pulsating"></span>
              <span>192.168.1.10</span>
            </div>
          </div>

          <button 
            onClick={() => handleOpenBarrier('Làn Vào')}
            className="btn-primary" 
            style={{ width: '100%', marginTop: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', textAlign: 'center', justifyContent: 'center' }}
          >
            {t("Mở Barie")}
          </button>
        </div>

        {/* Làn Ra */}
        <div className="config-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#dc2626', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t("Làn Ra")}</span>
            <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px' }}>CAM-02 ACTIVE</span>
          </div>

          <div style={{ width: '100%', height: '360px', background: '#090d16', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            {screenOutVideo ? (
              <video 
                src={screenOutVideo} 
                autoPlay 
                loop 
                muted 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setScreenOutVideo('')}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                <FiVideo size={48} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>CAM-02 LIVE</span>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(15,23,42,0.75)', color: 'white', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-dot-pulsating"></span>
              <span>192.168.1.11</span>
            </div>
          </div>

          <button 
            onClick={() => handleOpenBarrier('Làn Ra')}
            className="btn-primary" 
            style={{ width: '100%', marginTop: '16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', textAlign: 'center', justifyContent: 'center' }}
          >
            {t("Mở Barie")}
          </button>
        </div>
      </div>

      {/* CSS Anim style specific for monitoring screen */}
      <style>{`
        .pulsate-active {
          animation: pulsate 1.5s infinite ease-in-out;
        }
        @keyframes pulsate {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .live-dot-pulsating {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ef4444;
          display: inline-block;
          box-shadow: 0 0 6px #ef4444;
          animation: dot-pulse 1.2s infinite ease-in-out;
        }
        @keyframes dot-pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
