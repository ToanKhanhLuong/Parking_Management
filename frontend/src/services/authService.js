// src/services/authService.js

const API_URL = "http://localhost:8888/api/auth";

export const loginAPI = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Ném thẳng lỗi ra, bên file Login.jsx đã có sẵn try/catch để hứng cái lỗi này rồi
    throw new Error(data.message || "Đăng nhập thất bại!");
  }

  return data;
};