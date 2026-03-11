const Booking = require("../models/Booking");
const TeacherAdd = require("../models/TeacherAdd");


const hasConflict = async ({
  teacherAddId,
  teacherId,
  scheduledAt,
  excludeBookingId,
}) => {
  const slotStart = new Date(scheduledAt);
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); 

  const query = {
    teacherStatus: { $ne: "cancelled" },
    scheduledAt: {
      $gte: new Date(slotStart.getTime() - 59 * 60 * 1000),
      $lt: slotEnd,
    },
  };

  if (teacherAddId) query.teacherAdd = teacherAddId;
  else if (teacherId) query.teacher = teacherId;

  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const conflict = await Booking.findOne(query).lean();
  return !!conflict;
};

const getBookings = async (req, res, next) => {
  try {
    let bookings;

    if (req.user.role === "business") {
      bookings = await Booking.find({ teacherUser: req.user._id })
        .populate("user", "name email")
        .populate(
          "teacherAd",
          "name surname avatar_url languages price_per_hour",
        )
        .sort({ scheduledAt: 1 });
    } else {
      bookings = await Booking.find({ user: req.user._id })
        .populate("teacher", "name surname avatar_url languages")
        .populate({
          path: "teacherAd",
          select: "name surname avatar_url languages price_per_hour",
        })
        .sort({ scheduledAt: 1 });
    }

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};


const createBooking = async (req, res, next) => {
  try {
    const {
      teacherAddId,
      teacherId,
      reason,
      fullName,
      email,
      phone,
      scheduledAt,
    } = req.body;

    if (!reason || !fullName || !email || !phone || !scheduledAt) {
      return res.status(400).json({
        message: "reason, fullName, email, phone and scheduledAt are required",
      });
    }
    if (!teacherAddId && !teacherId) {
      return res
        .status(400)
        .json({ message: "teacherAddId or teacherId is required" });
    }
    if (new Date(scheduledAt) < new Date()) {
      return res
        .status(400)
        .json({ message: "scheduledAt must be in the future" });
    }

    const conflict = await hasConflict({
      teacherAddId,
      teacherId,
      scheduledAt,
    });
    if (conflict) {
      return res.status(409).json({
        message:
          "This time slot is already booked. Please choose a different time.",
      });
    }

    let teacherUser = null;
    if (teacherAddId) {
      const ad = await TeacherAdd.findById(teacherAddId).lean();
      if (!ad) return res.status(404).json({ message: "Teacher ad not found" });
      teacherUser = ad.owner;
    }

    const booking = await Booking.create({
      user: req.user._id,
      teacher: teacherId || null,
      teacherAdd: teacherAddId || null,
      teacherUser,
      reason,
      fullName,
      email,
      phone,
      scheduledAt,
    });

    const populated = await Booking.findById(booking._id)
      .populate("teacher", "name surname avatar_url languages")
      .populate(
        "teacherAdd",
        "name surname avatar_url languages price_per_hour",
      );

    res.status(201).json({ booking: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This time slot is already booked. Please choose a different time.",
      });
    }
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

    if (booking.teacherStatus !== "pending") {
      return res.status(400).json({
        message:
          "Cannot modify a booking that has already been confirmed or cancelled",
      });
    }

    const { scheduledAt, reason, fullName, email, phone } = req.body;

    if (scheduledAt && scheduledAt !== booking.scheduledAt?.toISOString()) {
      if (new Date(scheduledAt) < new Date()) {
        return res
          .status(400)
          .json({ message: "scheduledAt must be in the future" });
      }
      const conflict = await hasConflict({
        teacherAddId: booking.teacherAdd,
        teacherId: booking.teacher,
        scheduledAt,
        excludeBookingId: booking._id,
      });
      if (conflict) {
        return res.status(409).json({
          message:
            "This time slot is already booked. Please choose a different time.",
        });
      }
      booking.scheduledAt = scheduledAt;
    }

    if (reason) booking.reason = reason;
    if (fullName) booking.fullName = fullName;
    if (email) booking.email = email;
    if (phone) booking.phone = phone;

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("teacher", "name surname avatar_url languages")
      .populate(
        "teacherAdd",
        "name surname avatar_url languages price_per_hour",
      );

    res.json({ booking: populated });
  } catch (error) {
    next(error);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.teacherStatus = "cancelled";
    booking.cancelledBy = "student";
    await booking.save();

    res.json({ message: "Booking cancelled by student", booking });
  } catch (error) {
    next(error);
  }
};

const confirmBooking = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only teachers can confirm bookings" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      teacherUser: req.user._id,
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.teacherStatus !== "pending") {
      return res.status(400).json({
        message: `Booking is already ${booking.teacherStatus}`,
      });
    }

    booking.teacherStatus = "confirmed";
    booking.teacherMessage = req.body.message || "";
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("user", "name email")
      .populate(
        "teacherAdd",
        "name surname avatar_url languages price_per_hour",
      );

    res.json({ booking: populated });
  } catch (error) {
    next(error);
  }
};


const cancelBookingByTeacher = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only teachers can use this endpoint" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      teacherUser: req.user._id,
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.teacherStatus === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.teacherStatus = "cancelled";
    booking.cancelledBy = "teacher";
    booking.teacherMessage = req.body.message || "";
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("user", "name email")
      .populate(
        "teacherAdd",
        "name surname avatar_url languages price_per_hour",
      );

    res.json({ booking: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  confirmBooking,
  cancelBookingByTeacher,
};
