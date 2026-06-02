// src/services/configService.js

const API_URL = "http://localhost:8888/api/config";

// Helper tự động gắn JWT Token từ localStorage vào Headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

// ==========================================
// 1. Cấu hình Thông Tin Bãi Xe
// ==========================================
export const getParkingInfoAPI = async () => {
  const response = await fetch(`${API_URL}/info`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể tải thông tin bãi xe.");
  return data;
};

export const updateParkingInfoAPI = async (infoData) => {
  const response = await fetch(`${API_URL}/info`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(infoData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể cập nhật thông tin bãi xe.");
  return data;
};

// ==========================================
// 2. Cấu hình Giá Vé
// ==========================================
export const getParkingRatesAPI = async () => {
  const response = await fetch(`${API_URL}/rates`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể tải cấu hình giá vé.");
  return data;
};

export const updateParkingRatesAPI = async (ratesData) => {
  const response = await fetch(`${API_URL}/rates`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(ratesData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể cập nhật cấu hình giá vé.");
  return data;
};

// ==========================================
// 3. Cấu hình Màn Hình Barrier
// ==========================================
export const getBarrierScreensAPI = async () => {
  const response = await fetch(`${API_URL}/screens`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể tải cấu hình màn hình.");
  return data;
};

export const updateBarrierScreensAPI = async (screensData) => {
  const response = await fetch(`${API_URL}/screens`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(screensData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể cập nhật cấu hình màn hình.");
  return data;
};

// ==========================================
// 4. Thiết lập hệ thống & Actions
// ==========================================
export const getSystemSettingsAPI = async () => {
  const response = await fetch(`${API_URL}/system`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể tải thiết lập hệ thống.");
  return data;
};

export const updateSystemSettingsAPI = async (settingsData) => {
  const response = await fetch(`${API_URL}/system`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(settingsData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể cập nhật thiết lập hệ thống.");
  return data;
};

export const backupSystemAPI = async () => {
  const response = await fetch(`${API_URL}/system/backup`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể thực hiện sao lưu.");
  return data;
};

export const rebootSystemAPI = async () => {
  const response = await fetch(`${API_URL}/system/reboot`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể thực hiện khởi động lại.");
  return data;
};

// ==========================================
// 5. Quản lý Thiết Bị (CRUD)
// ==========================================
export const getDevicesAPI = async () => {
  const response = await fetch(`${API_URL}/devices`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể tải danh sách thiết bị.");
  return data;
};

export const createDeviceAPI = async (deviceData) => {
  const response = await fetch(`${API_URL}/devices`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(deviceData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể thêm thiết bị mới.");
  return data;
};

export const updateDeviceAPI = async (id, deviceData) => {
  const response = await fetch(`${API_URL}/devices/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(deviceData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể cập nhật thiết bị.");
  return data;
};

export const deleteDeviceAPI = async (id) => {
  const response = await fetch(`${API_URL}/devices/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể xóa thiết bị.");
  return data;
};

// ==========================================
// 6. Quản lý Tài Khoản Nhân Viên (CRUD)
// ==========================================
export const getStaffAPI = async () => {
  const response = await fetch(`${API_URL}/staff`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể tải danh sách nhân sự.");
  return data;
};

export const createStaffAPI = async (staffData) => {
  const response = await fetch(`${API_URL}/staff`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(staffData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể thêm nhân viên mới.");
  return data;
};

export const updateStaffAPI = async (id, staffData) => {
  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(staffData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể cập nhật nhân sự.");
  return data;
};

export const deleteStaffAPI = async (id) => {
  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể xóa nhân sự.");
  return data;
};

// ==========================================
// 7. Mở Barrier cưỡng bức (Giám sát)
// ==========================================
export const openBarrierAPI = async (gate) => {
  const response = await fetch(`${API_URL}/system/open-barrier`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ gate }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể mở cổng Barrier.");
  return data;
};
