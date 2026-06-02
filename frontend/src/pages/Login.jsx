import { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Navbar,
    Nav,
    ToggleButtonGroup,
    ToggleButton,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nProvider";
import { useAuth } from "../hooks/useAuth";

function LoginContent({ theme, setTheme }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { lang, setLang, t } = useI18n();
    const { login } = useAuth();

    const isDark = theme === "dark";

    useEffect(() => {
        document.body.className = "";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(username, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || t("login:error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-vh-100 d-flex flex-column"
            style={{
                color: isDark ? "#e5e7eb" : "#0f172a",
                background: isDark
                    ? "linear-gradient(135deg, #020617 0%, #0f172a 45%, #111827 100%)"
                    : "linear-gradient(135deg, #f8fafc 0%, #eef4ff 50%, #f3f8ff 100%)",
            }}
        >
            <Navbar
                variant={isDark ? "dark" : "light"}
                className="border-bottom px-4 py-3"
                style={{
                    background: isDark
                        ? "rgba(15,23,42,.82)"
                        : "rgba(255,255,255,.78)",
                    backdropFilter: "blur(14px)",
                    borderColor: isDark ? "rgba(255,255,255,.08)" : "#e5e7eb",
                }}
            >
                <Navbar.Brand
                    className="fw-bold fs-3"
                    style={{
                        color: isDark ? "#60a5fa" : "#075bd8",
                    }}
                >
                    ParkSmart Admin
                </Navbar.Brand>

                <Nav className="mx-auto gap-4 fw-semibold d-none d-md-flex">

                    <Nav.Link
                        className="border-bottom"
                        style={{
                            color: "#2563eb",
                            borderColor: "#2563eb",
                        }}
                    >
                        {t("login:login")}
                    </Nav.Link>
                </Nav>

                <div className="d-flex align-items-center gap-2">
                    <ToggleButtonGroup
                        type="radio"
                        name="theme"
                        value={theme}
                        onChange={(val) => setTheme(val)}
                        size="sm"
                    >
                        <ToggleButton id="light" value="light" variant="outline-primary">
                            ☀️
                        </ToggleButton>
                        <ToggleButton id="dark" value="dark" variant="outline-primary">
                            🌙
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <ToggleButtonGroup
                        type="radio"
                        name="lang"
                        value={lang}
                        onChange={(val) => setLang(val)}
                        size="sm"
                        className="d-none d-sm-flex"
                    >
                        <ToggleButton id="vi" value="vi" variant="outline-primary">
                            VI
                        </ToggleButton>
                        <ToggleButton id="en" value="en" variant="outline-primary">
                            EN
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Button
                        size="sm"
                        className="fw-bold px-3 border-0"
                        style={{
                            background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                        }}
                    >
                        Support
                    </Button>
                </div>
            </Navbar>

            <Container
                fluid
                className="flex-grow-1 d-flex align-items-center px-4 px-lg-5 py-5"
            >
                <Row className="w-100 align-items-center justify-content-center g-5">
                    <Col xs={12} lg={7} xl={7}>
                        <div
                            className="position-relative overflow-hidden"
                            style={{
                                minHeight: "520px",
                                borderRadius: "24px",
                                backgroundImage: "url('/parking.jpg')",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                boxShadow: isDark
                                    ? "0 30px 70px rgba(0,0,0,.55)"
                                    : "0 30px 70px rgba(30,64,175,.18)",
                            }}
                        >
                            <div
                                className="position-absolute top-0 start-0 w-100 h-100"
                                style={{
                                    background:
                                        "linear-gradient(180deg, rgba(15,23,42,.08) 0%, rgba(30,64,175,.88) 100%)",
                                }}
                            />

                            <div className="position-absolute bottom-0 start-0 text-white p-4 p-md-5">
                                <div
                                    className="mb-3 px-3 py-2 rounded-pill d-inline-block"
                                    style={{
                                        background: "rgba(255,255,255,.16)",
                                        backdropFilter: "blur(10px)",
                                        fontWeight: 700,
                                    }}
                                >
                                    Smart Parking System
                                </div>

                                <h1 className="fw-bold display-4 mb-3">
                                    {lang === "vi"
                                        ? "Quản lý chuyên nghiệp"
                                        : "Professional management"}
                                </h1>

                                <p className="fs-5 mb-0" style={{ maxWidth: 760 }}>
                                    {lang === "vi"
                                        ? "Giải pháp tối ưu cho việc vận hành bãi đỗ xe thông minh thế hệ mới."
                                        : "The optimal solution for next-gen smart parking management."}
                                </p>
                            </div>
                        </div>
                    </Col>

                    <Col xs={12} sm={11} md={9} lg={5} xl={4}>
                        <Card
                            className="border-0 rounded-4"
                            style={{
                                background: isDark
                                    ? "rgba(15,23,42,.92)"
                                    : "rgba(255,255,255,.95)",
                                color: isDark ? "#e5e7eb" : "#0f172a",
                                boxShadow: isDark
                                    ? "0 30px 70px rgba(0,0,0,.55)"
                                    : "0 25px 50px rgba(15,23,42,.14)",
                                backdropFilter: "blur(16px)",
                            }}
                        >
                            <Card.Body className="p-4 p-md-5">
                                <div
                                    className="mx-auto mb-4 d-flex align-items-center justify-content-center text-white fw-bold fs-1"
                                    style={{
                                        width: 82,
                                        height: 82,
                                        borderRadius: 22,
                                        background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                                        boxShadow: "0 16px 34px rgba(37,99,235,.38)",
                                    }}
                                >
                                    P
                                </div>

                                <h2 className="text-center fw-bold mb-2">
                                    {t("login:welcome")}
                                </h2>

                                <p
                                    className="text-center mb-4"
                                    style={{ color: isDark ? "#94a3b8" : "#64748b" }}
                                >
                                    {t("login:system")}
                                </p>

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">
                                            {t("login:username")}
                                        </Form.Label>
                                        <Form.Control
                                            size="lg"
                                            type="text"
                                            placeholder={t("login:username_placeholder")}
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            style={{
                                                background: isDark ? "#020617" : "#f8fafc",
                                                color: isDark ? "#e5e7eb" : "#0f172a",
                                                borderColor: isDark ? "#334155" : "#cbd5e1",
                                            }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">
                                            {t("login:password")}
                                        </Form.Label>
                                        <Form.Control
                                            size="lg"
                                            type="password"
                                            placeholder={t("login:password_placeholder")}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            style={{
                                                background: isDark ? "#020617" : "#f8fafc",
                                                color: isDark ? "#e5e7eb" : "#0f172a",
                                                borderColor: isDark ? "#334155" : "#cbd5e1",
                                            }}
                                        />
                                    </Form.Group>

                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <Form.Check
                                            type="checkbox"
                                            label={t("login:remember")}
                                            style={{ color: isDark ? "#94a3b8" : "#64748b" }}
                                        />

                                        <a
                                            href="#"
                                            className="fw-semibold text-decoration-none"
                                            style={{ color: "#2563eb" }}
                                        >
                                            {t("login:forgot")}
                                        </a>
                                    </div>

                                    {error && (
                                        <div className="text-danger text-center mb-3">{error}</div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        size="lg"
                                        className="w-100 fw-bold py-3 fs-4 border-0"
                                        style={{
                                            background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                                            boxShadow: "0 14px 28px rgba(37,99,235,.28)",
                                        }}
                                    >
                                        {loading ? t("login:logging_in") : t("login:login")}
                                    </Button>
                                </Form>

                                <hr
                                    className="my-4"
                                    style={{
                                        borderColor: isDark
                                            ? "rgba(255,255,255,.14)"
                                            : "rgba(15,23,42,.14)",
                                    }}
                                />

                                <p
                                    className="text-center mb-3"
                                    style={{ color: isDark ? "#94a3b8" : "#64748b" }}
                                >
                                    {t("login:no_account")}
                                </p>

                                <Button
                                    size="lg"
                                    className="w-100 fw-bold"
                                    variant="outline-primary"
                                >
                                    {t("login:request_access")}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <footer
                className="border-top px-4 py-3 d-flex flex-wrap justify-content-between align-items-center gap-3"
                style={{
                    background: isDark ? "rgba(15,23,42,.82)" : "rgba(255,255,255,.8)",
                    backdropFilter: "blur(14px)",
                    borderColor: isDark ? "rgba(255,255,255,.08)" : "#e5e7eb",
                }}
            >
                <strong>ParkSmart</strong>

                <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
                    © 2024 Smart Parking Management System. All rights reserved.
                </span>

                <div
                    className="d-flex gap-4 small flex-wrap"
                    style={{ color: isDark ? "#cbd5e1" : "#334155" }}
                >
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                    <span>Contact Support</span>
                </div>
            </footer>
        </div>
    );
}

export default function Login() {
    const [theme, setTheme] = useState("light");

    return (
        <LoginContent theme={theme} setTheme={setTheme} />
    );
}