const express = require("express");
const router = express.Router();
const {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  confirmBooking,
  cancelBookingByTeacher,
} = require("../controllers/booking.controller");
const { protect } = require("../middleware/auth");

router.get("/", protect, getBookings);
router.post("/", protect, createBooking);
router.patch("/:id", protect, updateBooking);
router.delete("/:id", protect, deleteBooking);

router.patch("/:id/confirm", protect, confirmBooking);
router.patch("/:id/cancel", protect, cancelBookingByTeacher);

module.exports = router;
