const express = require("express");
const cors = require("cors");

require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());
app.use(cors());

const orderRoutes = require("./routes/order");
const adminRoutes = require("./routes/adminRoutes");
const menuRoutes = require("./routes/menu");
const announcementRoutes = require("./routes/announcements");

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/announcements", announcementRoutes);

const start = async () => {
  try {
    await connectDB();
    // ensure admin account exists (reads ADMIN_EMAIL / ADMIN_PASSWORD from env)
    const ensureAdmin = require("./config/adminSetup");
    await ensureAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
