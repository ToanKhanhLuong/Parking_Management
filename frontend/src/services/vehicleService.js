// src/services/vehicleService.js

const API_URL = "http://localhost:8888/api/vehicles";
// Helper để sinh Headers có kèm JWT Token tự động
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// 1. Lấy danh sách xe kèm bộ lọc tìm kiếm
export const getVehiclesAPI = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.vehicleType)
    queryParams.append("vehicleType", filters.vehicleType);
  if (filters.cardType) queryParams.append("cardType", filters.cardType);

  const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Không thể tải danh sách phương tiện.");
  return data;
};

// 1.1 Lấy dữ liệu thống kê tổng quan (Dashboard Stats)
export const getDashboardStatsAPI = async () => {
  const response = await fetch(`${API_URL}/dashboard-stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Không thể tải số liệu thống kê.");
  return data;
};

// 2. Tạo mới đăng ký xe
export const registerVehicleAPI = async (vehicleData) => {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(vehicleData),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Đăng ký phương tiện thất bại.");
  return data;
};

// 3. Gia hạn vé
export const extendVehicleAPI = async (
  id,
  months,
  paymentMethod = "Tiền mặt",
) => {
  const response = await fetch(`${API_URL}/${id}/extend`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ months: Number(months), paymentMethod }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gia hạn vé thất bại.");
  return data;
};

// 3.1 Lấy trạng thái thanh toán hóa đơn
export const getPaymentStatusAPI = async (paymentId) => {
  const response = await fetch(`${API_URL}/payments/${paymentId}/status`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Không thể tải trạng thái thanh toán.");
  return data;
};

// 3.2 Giả lập chuyển khoản thành công
export const simulatePaymentSuccessAPI = async (paymentId, months) => {
  const response = await fetch(
    `${API_URL}/payments/${paymentId}/simulate-success`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ months: Number(months) }),
    },
  );

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Giả lập thanh toán thất bại.");
  return data;
};

// 4. Cập nhật thông tin xe
export const updateVehicleAPI = async (id, vehicleData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(vehicleData),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Cập nhật phương tiện thất bại.");
  return data;
};

// 5. Xóa đăng ký xe
export const deleteVehicleAPI = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Xóa đăng ký xe thất bại.");
  return data;
};

// 6. Lấy bảng giá đỗ xe
export const getRatesAPI = async () => {
  const response = await fetch(`${API_URL}/rates`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể lấy bảng giá.");
  return data;
};

// 7. Lấy báo cáo doanh thu tổng hợp
export const getRevenueReportAPI = async () => {
  const response = await fetch(`${API_URL}/reports/revenue`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Không thể tải báo cáo doanh thu.");
  return data;
};

// 8. Lấy nhật ký xe ra vào bãi
export const getParkingLogsAPI = async (search = "") => {
  const response = await fetch(
    `${API_URL}/reports/logs?search=${encodeURIComponent(search)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Không thể tải nhật ký ra vào.");
  return data;
};

// 9. Lấy nhật ký cảnh báo
export const getAlertLogsAPI = async () => {
  const response = await fetch(`${API_URL}/reports/alerts`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Không thể tải nhật ký cảnh báo.");
  return data;
};
