
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { I18nProvider } from "./context/I18nProvider";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import VehicleList from "./pages/VehicleList";
import VehicleRegister from "./pages/VehicleRegister";
import ExtendTicket from "./pages/ExtendTicket";
import Reports from "./pages/Reports";

// Import các trang cấu hình & quản lý thiết bị mới
import DevicesManagement from "./pages/DevicesManagement";
import ParkingInfoConfig from "./pages/ParkingInfoConfig";
import TicketRatesConfig from "./pages/TicketRatesConfig";
import BarrierScreensConfig from "./pages/BarrierScreensConfig";
import StaffManagement from "./pages/StaffManagement";
import SystemSettings from "./pages/SystemSettings";
import Monitor from "./pages/Monitor";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="vehicles" element={<VehicleList />} />
              <Route path="register" element={<VehicleRegister />} />
              <Route path="extend" element={<ExtendTicket />} />
              <Route path="reports" element={<Reports />} />
              <Route path="monitor" element={<Monitor />} />
              
              {/* Cấu hình hệ thống & thiết bị */}
              <Route path="devices" element={<DevicesManagement />} />
              <Route path="config/info" element={<ParkingInfoConfig />} />
              <Route path="config/rates" element={<TicketRatesConfig />} />
              <Route path="config/screens" element={<BarrierScreensConfig />} />
              <Route path="config/staff" element={<StaffManagement />} />
              <Route path="config/system" element={<SystemSettings />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </AuthProvider>
  );
}

export default App;
