// src/pages/BarrierScreensConfig.jsx
import React, { useState, useEffect } from 'react';
import { getBarrierScreensAPI, updateBarrierScreensAPI } from '../services/configService';
import { FiSave, FiMonitor, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './ConfigPages.css';

export default function BarrierScreensConfig() {
  const [screenInImage, setScreenInImage] = useState('');
  const [screenInVideo, setScreenInVideo] = useState('');
  const [screenOutImage, setScreenOutImage] = useState('');
  const [screenOutVideo, setScreenOutVideo] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScreens = async () => {
      try {
        const data = await getBarrierScreensAPI();
        setScreenInImage(data.screen_in_image || '');
        setScreenInVideo(data.screen_in_video || '');
        setScreenOutImage(data.screen_out_image || '');
        setScreenOutVideo(data.screen_out_video || '');
      } catch (err) {
        setError(err.message || 'Không thể tải cấu hình màn hình.');
      } finally {
        setLoading(false);
      }
    };
    fetchScreens();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        screen_in_image: screenInImage,
        screen_in_video: screenInVideo,
        screen_out_image: screenOutImage,
        screen_out_video: screenOutVideo
      };
      await updateBarrierScreensAPI(payload);
      setSuccess('Cập nhật cấu hình màn hình barrier thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật cấu hình màn hình.');
    } finally {
      setSaving(false);
    }
  };

  const simulateFileChoose = (field) => {
    // Giả lập chọn ảnh/video
    let fakePath = '';
    if (field.includes('image')) {
      fakePath = `https://images.unsplash.com/photo-${field.includes('in') ? '1540959733332-eab4deceeaf7' : '1568605114967-8130f3a36994'}?auto=format&fit=crop&w=400&q=80`;
    } else {
      fakePath = `https://assets.mixkit.co/videos/preview/mixkit-${field.includes('in') ? 'highway-traffic-at-night-4226' : 'underground-parking-garage-with-cars-3180'} -large.mp4`;
    }
    
    if (field === 'screenInImage') setScreenInImage(fakePath);
    else if (field === 'screenInVideo') setScreenInVideo(fakePath);
    else if (field === 'screenOutImage') setScreenOutImage(fakePath);
    else if (field === 'screenOutVideo') setScreenOutVideo(fakePath);

    alert(`Giả lập tải file lên: ${fakePath.substring(0, 60)}...`);
  };

  if (loading) {
    return <div className="config-container" style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải cấu hình màn hình...</div>;
  }

  return (
    <div className="config-container">
      <h1 className="config-title">Cấu Hình Màn Hình Barrier</h1>

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

      <form onSubmit={handleSave}>
        <div className="config-grid-2">
          {/* Entrance screen */}
          <div className="screen-column">
            <div className="config-card-header" style={{ borderBottom: '3px solid #047857', color: '#047857', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMonitor />
                <span>Màn Hình Lối Vào</span>
              </div>
            </div>

            <div className="config-form-group" style={{ marginTop: '14px' }}>
              <label className="config-label">Hình Ảnh Màn Hình Chờ</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={screenInImage} 
                  onChange={(e) => setScreenInImage(e.target.value)} 
                  className="config-input" 
                  placeholder="Đường dẫn hình ảnh"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => simulateFileChoose('screenInImage')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                  Choose File
                </button>
              </div>
            </div>

            <div className="config-form-group">
              <label className="config-label">Video Hướng Dẫn/Quảng Cáo</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={screenInVideo} 
                  onChange={(e) => setScreenInVideo(e.target.value)} 
                  className="config-input" 
                  placeholder="Đường dẫn video"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => simulateFileChoose('screenInVideo')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                  Choose File
                </button>
              </div>
            </div>

            <div className="screen-media-preview">
              <span className="media-tag">PREVIEW LỐI VÀO</span>
              {screenInImage ? (
                <img src={screenInImage} alt="Entrance screen waiting preview" onError={(e) => {e.target.style.display='none'}} />
              ) : (
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Chưa có hình ảnh được chọn</span>
              )}
            </div>
          </div>

          {/* Exit screen */}
          <div className="screen-column">
            <div className="config-card-header" style={{ borderBottom: '3px solid #b91c1c', color: '#b91c1c', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMonitor />
                <span>Màn Màn Hình Lối Ra</span>
              </div>
            </div>

            <div className="config-form-group" style={{ marginTop: '14px' }}>
              <label className="config-label">Hình Ảnh Màn Hình Chờ</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={screenOutImage} 
                  onChange={(e) => setScreenOutImage(e.target.value)} 
                  className="config-input" 
                  placeholder="Đường dẫn hình ảnh"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => simulateFileChoose('screenOutImage')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                  Choose File
                </button>
              </div>
            </div>

            <div className="config-form-group">
              <label className="config-label">Video Hướng Dẫn/Quảng Cáo</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={screenOutVideo} 
                  onChange={(e) => setScreenOutVideo(e.target.value)} 
                  className="config-input" 
                  placeholder="Đường dẫn video"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => simulateFileChoose('screenOutVideo')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                  Choose File
                </button>
              </div>
            </div>

            <div className="screen-media-preview">
              <span className="media-tag">PREVIEW LỐI RA</span>
              {screenOutImage ? (
                <img src={screenOutImage} alt="Exit screen waiting preview" onError={(e) => {e.target.style.display='none'}} />
              ) : (
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Chưa có hình ảnh được chọn</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '12px 24px' }}>
            <FiSave /> {saving ? 'Đang lưu cấu hình...' : 'Lưu Cấu Hình'}
          </button>
        </div>
      </form>
    </div>
  );
}
