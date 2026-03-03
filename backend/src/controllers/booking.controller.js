const Booking = require("../models/Booking");

const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("teacher", "name surname avatar_url languages")
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const { teacherId, reason, fullName, email, phone, scheduledAt } = req.body;

    if (!teacherId || !reason || !fullName || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      teacher: teacherId,
      reason,
      fullName,
      email,
      phone,
      scheduledAt,
    });

    const populated = await booking.populate(
      "teacher",
      "name surname avatar_url languages",
    );
    res.status(201).json({ booking: populated });
  } catch (error) {
    next(error);
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const { scheduledAt, reason, fullName, email, phone } = req.body;
    if (scheduledAt) booking.scheduledAt = scheduledAt;
    if (reason) booking.reason = reason;
    if (fullName) booking.fullName = fullName;
    if (email) booking.email = email;
    if (phone) booking.phone = phone;

    await booking.save();
    const populated = await booking.populate(
      "teacher",
      "name surname avatar_url languages",
    );
    res.json({ booking: populated });
  } catch (error) {
    next(error);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking cancelled" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBookings, createBooking, updateBooking, deleteBooking };
