require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const teacherRoutes = require("./routes/teacher.routes");
const teacherAdRoutes = require("./routes/teacherAd.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const bookingRoutes = require("./routes/booking.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/teacher-ads", teacherAdRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/bookings", bookingRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});
app.use(errorHandler);

module.exports = app;
