import { createContext, useState, useEffect } from "react";
import { loginAPI } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Khôi phục phiên từ localStorage nếu chưa quá 15 phút không thao tác
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    const lastActive = localStorage.getItem("lastActive");
    if (savedToken && lastActive) {
      const inactiveTime = Date.now() - Number(lastActive);
      const timeoutLimit = 15 * 60 * 1000; // 15 phút không thao tác
      if (inactiveTime < timeoutLimit) {
        localStorage.setItem("lastActive", String(Date.now()));
        return savedToken;
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastActive");
    return null;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const lastActive = localStorage.getItem("lastActive");
    if (savedUser && lastActive) {
      const inactiveTime = Date.now() - Number(lastActive);
      const timeoutLimit = 15 * 60 * 1000;
      if (inactiveTime < timeoutLimit) {
        try {
          return JSON.parse(savedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Theo dõi hoạt động của người dùng để cập nhật thời gian hoạt động cuối
  useEffect(() => {
    if (!token) return;

    let lastUpdate = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > 10000) { // Cập nhật tối đa 1 lần mỗi 10 giây để tránh lag
        localStorage.setItem("lastActive", String(now));
        lastUpdate = now;
      }
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    // Cập nhật ngay khi mount
    localStorage.setItem("lastActive", String(Date.now()));

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
    };
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await loginAPI(username, password);
      // Expected backend response: { token: string, user: object }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("lastActive", String(Date.now()));
      return data;
    } catch (error) {
      console.error("Login service failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastActive");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
