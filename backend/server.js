const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Kết nối MySQL
const db = require("./config/db");

// Import Router
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const configRoutes = require("./routes/configRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8888;

// Test server mặc định
app.get("/", (req, res) => {
  res.json({
    message: "Server running",
    port: PORT
  });
});

// Khai báo đường dẫn API cho Auth
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/config", configRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});