import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  getVehiclesAPI,
  extendVehicleAPI,
  getRatesAPI,
  getPaymentStatusAPI,
  simulatePaymentSuccessAPI,
} from "../services/vehicleService";
import {
  FiClock,
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiCalendar,
  FiArrowLeft,
  FiUser,
  FiInfo,
  FiLoader,
} from "react-icons/fi";
import "./VehiclePages.css";

export default function ExtendTicket() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc từ URL hoặc navigation state
  const plateParam =
    searchParams.get("plate") || location.state?.plate_number || "";
  const monthsParam = Number(searchParams.get("months")) || 1;

  // States
  const [searchPlate, setSearchPlate] = useState(plateParam);
  const [vehicle, setVehicle] = useState(null);
  const [rates, setRates] = useState({
    car_monthly: 1500000,
    motorbike_monthly: 120000,
  });
  const [selectedMonths, setSelectedMonths] = useState(monthsParam);
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");

  // States cho QR Code Payment Modal
  const [activePayment, setActivePayment] = useState(null); // { paymentId, amount, newExpiryDate }
  const [countdown, setCountdown] = useState(10);

  // Trạng thái tải & Báo lỗi
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Tải bảng giá đỗ xe
  const fetchRates = async () => {
    try {
      const data = await getRatesAPI();
      setRates(data);
    } catch (err) {
      console.error("Không thể lấy bảng giá dịch vụ:", err);
    }
  };

  // Tự động tìm kiếm khi có biển số trên URL (Reload)
  useEffect(() => {
    fetchRates();
    if (plateParam) {
      handleSearch(null, plateParam);
    }
  }, [plateParam]);

  // Cập nhật URL khi số tháng thay đổi
  const handleSelectMonths = (months) => {
    setSelectedMonths(months);
    if (searchPlate.trim()) {
      setSearchParams({ plate: searchPlate.trim(), months });
    } else {
      setSearchParams({ months });
    }
  };

  // Tìm kiếm thông tin xe bằng biển số
  const handleSearch = async (e, directPlate = "") => {
    if (e) e.preventDefault();
    const plate = directPlate || searchPlate;
    if (!plate.trim()) return;

    setSearching(true);
    setSearchError("");
    setSuccess("");
    setError("");
    setVehicle(null);

    // Đồng bộ lên URL
    setSearchParams({ plate: plate.trim(), months: selectedMonths });

    try {
      // Gọi danh sách xe lọc chính xác theo biển số
      const list = await getVehiclesAPI({ search: plate.trim() });
      const found = list.find(
        (v) => v.plate_number.toUpperCase() === plate.trim().toUpperCase(),
      );

      if (!found) {
        setSearchError(
          `Không tìm thấy phương tiện đăng ký với biển số "${plate}".`,
        );
      } else {
        setVehicle(found);
      }
    } catch (err) {
      setSearchError(err.message || "Lỗi khi tìm kiếm phương tiện.");
    } finally {
      setSearching(false);
    }
  };

  // Submit gia hạn vé (Tiền mặt hoặc tạo yêu cầu thanh toán QR)
  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!vehicle) return;

    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      const res = await extendVehicleAPI(
        vehicle.id,
        selectedMonths,
        paymentMethod,
      );

      if (paymentMethod === "Tiền mặt") {
        setSuccess(`Gia hạn thành công! ${res.message}`);
        setVehicle({
          ...vehicle,
          expiry_date: res.newExpiryDate,
          status: "ACTIVE",
        });
      } else {
        // Mở Modal thanh toán QR
        setActivePayment({
          paymentId: res.paymentId,
          amount: res.amount,
          newExpiryDate: res.newExpiryDate,
        });
        setCountdown(10);
      }
    } catch (err) {
      setError(err.message || "Gia hạn vé phương tiện thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Giả lập chuyển khoản thành công trực tiếp
  const handleSimulatePaymentSuccess = async () => {
    if (!activePayment) return;
    try {
      const res = await simulatePaymentSuccessAPI(
        activePayment.paymentId,
        selectedMonths,
      );
      setSuccess(`Gia hạn thành công qua QR! ${res.message}`);
      setVehicle({
        ...vehicle,
        expiry_date: activePayment.newExpiryDate,
        status: "ACTIVE",
      });
      setActivePayment(null);
    } catch (err) {
      setError(err.message || "Giả lập thanh toán thất bại.");
    }
  };

  // Polling và đếm ngược tự động giả lập
  useEffect(() => {
    if (!activePayment) return;

    let pollInterval = setInterval(async () => {
      try {
        const data = await getPaymentStatusAPI(activePayment.paymentId);
        if (data.status === "PAID") {
          setSuccess(`Thanh toán QR thành công! Vé đã được gia hạn tự động.`);
          setVehicle({
            ...vehicle,
            expiry_date: activePayment.newExpiryDate,
            status: "ACTIVE",
          });
          setActivePayment(null);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra thanh toán:", err);
      }
    }, 2000);

    // Đếm ngược 10 giây để tự động kích hoạt giả lập thành công
    let countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          simulatePaymentSuccessAPI(activePayment.paymentId, selectedMonths)
            .then(() => {
              setSuccess(
                `Hệ thống nhận diện giao dịch thành công! Vé đã được gia hạn.`,
              );
              setVehicle({
                ...vehicle,
                expiry_date: activePayment.newExpiryDate,
                status: "ACTIVE",
              });
              setActivePayment(null);
            })
            .catch((err) => console.error("Tự động giả lập thất bại:", err));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, [activePayment, vehicle, selectedMonths]);

  // Định dạng tiền tệ VND
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  // Định dạng ngày hiển thị đẹp
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  // Tính toán số tiền gia hạn dựa trên loại xe
  const getMonthlyRate = () => {
    if (!vehicle) return 0;
    return vehicle.vehicle_type === "Ô tô"
      ? Number(rates.car_monthly)
      : Number(rates.motorbike_monthly);
  };

  // Tính toán tổng tiền có áp dụng ưu đãi chiết khấu
  const calculateTotal = (months) => {
    const basePrice = getMonthlyRate() * months;
    if (months === 3) return basePrice * 0.95; // Chiết khấu 5% khi đóng 3 tháng
    if (months === 6) return basePrice * 0.9; // Chiết khấu 10% khi đóng 6 tháng
    return basePrice;
  };

  // Tính ngày hết hạn dự kiến mới
  const getExpectedExpiryDate = () => {
    if (!vehicle) return "";
    let baseDate = new Date();
    if (vehicle.expiry_date && new Date(vehicle.expiry_date) > new Date()) {
      baseDate = new Date(vehicle.expiry_date);
    }
    baseDate.setMonth(baseDate.getMonth() + selectedMonths);
    return baseDate;
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-header-title">Gia Hạn Vé Gửi Xe</h1>
          <p className="page-subtitle">
            Gia hạn thời hạn sử dụng vé tháng, đóng phí đỗ xe định kỳ cho phương
            tiện
          </p>
        </div>
        <button
          className="btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => navigate("/dashboard/vehicles")}
        >
          <FiArrowLeft />
          <span>Danh sách xe</span>
        </button>
      </div>

      {success && (
        <div className="success-banner">
          <FiCheckCircle size={20} />
          <div>
            <div style={{ fontWeight: 700 }}>Gia Hạn Thành Công!</div>
            <div>{success}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <FiAlertCircle size={20} />
          <div>
            <div style={{ fontWeight: 700 }}>Đã xảy ra lỗi!</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Tra cứu biển số */}
      <div
        className="glass-card"
        style={{ maxWidth: "650px", margin: "0 auto 24px auto" }}
      >
        <form onSubmit={(e) => handleSearch(e)}>
          <div className="plate-lookup-box">
            <div className="form-group-col">
              <label className="form-label form-label-required">
                Nhập Biển Số Xe Tra Cứu
              </label>
              <div className="search-input-wrapper">
                <FiSearch className="search-input-icon" />
                <input
                  type="text"
                  className="search-control"
                  placeholder="E.g. 30F-555.66..."
                  value={searchPlate}
                  onChange={(e) =>
                    setSearchPlate(
                      e.target.value.replace(/\s+/g, "").toUpperCase(),
                    )
                  }
                />
              </div>
            </div>
            <button type="submit" className="btn-lookup" disabled={searching}>
              {searching ? "Đang tìm..." : "Tra Cứu"}
            </button>
          </div>
        </form>

        {searchError && (
          <div className="error-banner" style={{ margin: 0 }}>
            <FiAlertCircle /> {searchError}
          </div>
        )}
      </div>

      {/* Thông tin chi tiết & Bảng gia hạn */}
      {vehicle && (
        <div
          className="glass-card"
          style={{ maxWidth: "650px", margin: "0 auto" }}
        >
          {/* Thông tin xe hiện tại */}
          <div className="info-summary-panel">
            <h4 className="info-summary-title">Thông Tin Phương Tiện</h4>

            <div className="info-summary-grid">
              <div className="info-summary-item">
                <span className="info-summary-label">Biển Số Xe</span>
                <div>
                  <span
                    className="plate-tag"
                    style={{ fontSize: "0.85rem", padding: "4px 10px" }}
                  >
                    {vehicle.plate_number}
                  </span>
                </div>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">Chủ Xe</span>
                <span
                  className="info-summary-val"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <FiUser color="var(--primary)" />{" "}
                  {vehicle.representative_name}
                </span>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">Số Điện Thoại</span>
                <span className="info-summary-val">{vehicle.phone || "-"}</span>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">Loại Thẻ / Xe</span>
                <span className="info-summary-val">
                  {vehicle.card_type} ({vehicle.vehicle_type})
                </span>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">
                  Ngày Hết Hạn Hiện Tại
                </span>
                <span
                  className="info-summary-val"
                  style={{
                    color:
                      new Date(vehicle.expiry_date) < new Date()
                        ? "var(--danger)"
                        : "var(--success)",
                  }}
                >
                  {formatDate(vehicle.expiry_date)}
                </span>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">Đơn Giá Vé Tháng</span>
                <span
                  className="info-summary-val"
                  style={{ color: "var(--primary)" }}
                >
                  {formatCurrency(getMonthlyRate())} / tháng
                </span>
              </div>
            </div>
          </div>

          {vehicle.card_type === "Thẻ VIP" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "16px",
                backgroundColor: "#f3f0ff",
                borderRadius: "8px",
                color: "#7950f2",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              <FiInfo size={20} />
              <span>
                Đây là Thẻ VIP, không phát sinh phí hàng tháng. Hạn dùng tự động
                dài hạn.
              </span>
            </div>
          ) : (
            <form onSubmit={handleExtendSubmit}>
              {/* Chọn các gói gia hạn */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  className="form-label"
                  style={{ marginBottom: "12px", display: "block" }}
                >
                  Chọn Gói Gia Hạn Vé
                </label>

                <div className="extend-cards-grid">
                  <div
                    className={`extend-option-card ${selectedMonths === 1 ? "card-selected" : ""}`}
                    onClick={() => handleSelectMonths(1)}
                  >
                    <span className="extend-months-num">1</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      Tháng
                    </span>
                    <span className="extend-price-tag">
                      {formatCurrency(calculateTotal(1))}
                    </span>
                  </div>

                  <div
                    className={`extend-option-card ${selectedMonths === 3 ? "card-selected" : ""}`}
                    onClick={() => handleSelectMonths(3)}
                  >
                    <span className="extend-saving-badge">Tiết kiệm 5%</span>
                    <span className="extend-months-num">3</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      Tháng
                    </span>
                    <span
                      className="extend-price-tag"
                      style={{
                        textDecoration: "line-through",
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                      }}
                    >
                      {formatCurrency(getMonthlyRate() * 3)}
                    </span>
                    <span className="extend-price-tag">
                      {formatCurrency(calculateTotal(3))}
                    </span>
                  </div>

                  <div
                    className={`extend-option-card ${selectedMonths === 6 ? "card-selected" : ""}`}
                    onClick={() => handleSelectMonths(6)}
                  >
                    <span
                      className="extend-saving-badge"
                      style={{ backgroundColor: "#10b981" }}
                    >
                      Tiết kiệm 10%
                    </span>
                    <span className="extend-months-num">6</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      Tháng
                    </span>
                    <span
                      className="extend-price-tag"
                      style={{
                        textDecoration: "line-through",
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                      }}
                    >
                      {formatCurrency(getMonthlyRate() * 6)}
                    </span>
                    <span className="extend-price-tag">
                      {formatCurrency(calculateTotal(6))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chọn phương thức thanh toán */}
              <div
                style={{
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "20px",
                  marginBottom: "20px",
                }}
              >
                <label
                  className="form-label"
                  style={{ marginBottom: "12px", display: "block" }}
                >
                  Phương Thức Thanh Toán
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div
                    className="payment-method-card"
                    onClick={() => setPaymentMethod("Tiền mặt")}
                    style={{
                      border:
                        paymentMethod === "Tiền mặt"
                          ? "2.5px solid var(--primary)"
                          : "1.5px solid var(--border-color)",
                      borderRadius: "10px",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      backgroundColor:
                        paymentMethod === "Tiền mặt"
                          ? "#eff6ff"
                          : "transparent",
                      transition: "all 0.2s ease",
                      boxShadow:
                        paymentMethod === "Tiền mặt"
                          ? "0 4px 6px -1px rgba(37, 99, 235, 0.1)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: "2px solid var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {paymentMethod === "Tiền mặt" && (
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "var(--primary)",
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: "var(--text-main)",
                        }}
                      >
                        Tiền Mặt
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Thanh toán tại quầy
                      </span>
                    </div>
                  </div>

                  <div
                    className="payment-method-card"
                    onClick={() => setPaymentMethod("QR")}
                    style={{
                      border:
                        paymentMethod === "QR"
                          ? "2.5px solid var(--primary)"
                          : "1.5px solid var(--border-color)",
                      borderRadius: "10px",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      backgroundColor:
                        paymentMethod === "QR" ? "#eff6ff" : "transparent",
                      transition: "all 0.2s ease",
                      boxShadow:
                        paymentMethod === "QR"
                          ? "0 4px 6px -1px rgba(37, 99, 235, 0.1)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: "2px solid var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {paymentMethod === "QR" && (
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "var(--primary)",
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: "var(--text-main)",
                        }}
                      >
                        Chuyển Khoản QR
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        MB Bank tự động nhận diện
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chi tiết thanh toán & Gia hạn dự kiến */}
              <div
                style={{
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "20px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                    fontSize: "0.92rem",
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>
                    Thời gian gia hạn mới:
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FiCalendar color="var(--primary)" />{" "}
                    {formatDate(getExpectedExpiryDate())}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "1.05rem",
                    borderTop: "1px dashed var(--border-color)",
                    paddingTop: "12px",
                    marginTop: "12px",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    Tổng Tiền Thanh Toán:
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: "var(--danger)",
                      fontSize: "1.3rem",
                    }}
                  >
                    {formatCurrency(calculateTotal(selectedMonths))}
                  </span>
                </div>
              </div>

              {/* Nút xác nhận thanh toán */}
              <button
                type="submit"
                className="btn-primary-action"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  justifyContent: "center",
                }}
              >
                <FiCreditCard />
                <span>
                  {submitting
                    ? "Đang giao dịch..."
                    : "Xác Nhận Thanh Toán & Gia Hạn"}
                </span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Modal Thanh toán QR Ngân hàng */}
      {activePayment && (
        <div className="modal-overlay">
          <div className="modal-window" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3
                className="modal-title"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FiCreditCard color="var(--primary)" />
                <span>Thanh Toán Chuyển Khoản QR</span>
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setActivePayment(null)}
              >
                ×
              </button>
            </div>

            <div
              className="modal-body"
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                >
                  Số tiền cần thanh toán
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    color: "var(--danger)",
                    margin: "4px 0",
                  }}
                >
                  {formatCurrency(activePayment.amount)}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  Hạn dùng mới:{" "}
                  <strong style={{ color: "#0f172a" }}>
                    {formatDate(activePayment.newExpiryDate)}
                  </strong>
                </div>
              </div>

              {/* VietQR Code Image */}
              <div
                style={{
                  position: "relative",
                  background: "#ffffff",
                  padding: "12px",
                  borderRadius: "16px",
                  border: "2px solid #cbd5e1",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <img
                  src={`https://api.vietqr.io/image/MB-0337086199-qr_only.jpg?amount=${activePayment.amount}&addInfo=GH%20${vehicle.plate_number.replace(/[^A-Z0-9]/gi, "")}%20P${activePayment.paymentId}&accountName=LUONG%20KHANH%20TOAN`}
                  alt="Mã QR Chuyển khoản"
                  style={{
                    width: "240px",
                    height: "240px",
                    display: "block",
                    borderRadius: "8px",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "#ffffff",
                    padding: "4px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="https://vietqr.net/portal-service/resources/images/logo-vietqr.png"
                    alt="VietQR"
                    style={{ height: "16px" }}
                  />
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div
                style={{
                  textAlign: "left",
                  width: "100%",
                  fontSize: "0.88rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  borderTop: "1px dashed var(--border-color)",
                  paddingTop: "16px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--text-muted)" }}>
                    Ngân hàng nhận:
                  </span>
                  <strong style={{ color: "var(--text-main)" }}>
                    MB Bank (Ngân hàng Quân Đội)
                  </strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--text-muted)" }}>
                    Số tài khoản:
                  </span>
                  <strong style={{ color: "var(--text-main)" }}>
                    0337086199
                  </strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--text-muted)" }}>
                    Tên tài khoản:
                  </span>
                  <strong style={{ color: "var(--text-main)" }}>
                    LUONG KHANH TOAN
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "#fffbeb",
                    border: "1px solid #fef3c7",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    marginTop: "4px",
                  }}
                >
                  <span style={{ color: "#b45309", fontWeight: 600 }}>
                    Nội dung chuyển khoản:
                  </span>
                  <strong
                    style={{
                      color: "#b45309",
                      fontFamily: "monospace",
                      fontSize: "0.95rem",
                    }}
                  >
                    GH {vehicle.plate_number.replace(/[^A-Z0-9]/gi, "")} P
                    {activePayment.paymentId}
                  </strong>
                </div>
              </div>

              {/* Status Polling Loading State */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "10px",
                  color: "var(--primary)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                <FiLoader
                  className="spin-animation"
                  style={{ animation: "spin 1.5s linear infinite" }}
                />
                <span>
                  Đang quét giao dịch ngân hàng... (Tự động cập nhật sau{" "}
                  {countdown}s)
                </span>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                backgroundColor: "#f8fafc",
                padding: "16px 24px",
              }}
            >
              <button
                type="button"
                className="btn-primary-form"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  background: "#10b981",
                  boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)",
                  border: "none",
                }}
                onClick={handleSimulatePaymentSuccess}
              >
                <FiCheckCircle />
                <span>Giả lập chuyển khoản thành công (Test nhanh)</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: "100%" }}
                onClick={() => setActivePayment(null)}
              >
                Hủy giao dịch
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
