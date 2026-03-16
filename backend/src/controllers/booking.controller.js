const Booking = require("../models/Booking");
const TeacherAd = require("../models/TeacherAd");
const Notification = require("../models/Notification");

const hasConflict = async ({
  teacherAdId,
  teacherId,
  scheduledAt,
  excludeBookingId,
}) => {
  const slotStart = new Date(scheduledAt);
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

  const query = {
    teacherStatus: { $nin: ["cancelled", "completed"] },
    scheduledAt: {
      $gte: new Date(slotStart.getTime() - 59 * 60 * 1000),
      $lt: slotEnd,
    },
  };

  if (teacherAdId) query.teacherAd = teacherAdId;
  else if (teacherId) query.teacher = teacherId;
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  return !!(await Booking.findOne(query).lean());
};

const notify = async ({ recipient, type, message, booking, teacherAd }) => {
  try {
    await Notification.create({ recipient, type, message, booking, teacherAd });
  } catch (e) {
    console.error("Notification error:", e.message);
  }
};

const getBookings = async (req, res, next) => {
  try {
    let bookings;

    if (req.user.role === "business") {
      bookings = await Booking.find({ teacherUser: req.user._id })
        .populate("user", "name surname email")
        .populate(
          "teacherAd",
          "name surname avatar_url languages price_per_hour",
        )
        .sort({ scheduledAt: 1 });
    } else {
      bookings = await Booking.find({ user: req.user._id })
        .populate("teacher", "name surname avatar_url languages price_per_hour")
        .populate(
          "teacherAd",
          "name surname avatar_url languages price_per_hour",
        )
        .sort({ scheduledAt: -1 });
    }

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const {
      teacherAdId,
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
    if (!teacherAdId && !teacherId) {
      return res
        .status(400)
        .json({ message: "teacherAdId or teacherId is required" });
    }
    if (new Date(scheduledAt) < new Date()) {
      return res
        .status(400)
        .json({ message: "scheduledAt must be in the future" });
    }

    const conflict = await hasConflict({ teacherAdId, teacherId, scheduledAt });
    if (conflict) {
      return res.status(409).json({
        message:
          "This time slot is already booked. Please choose a different time.",
      });
    }

    let teacherUser = null;
    if (teacherAdId) {
      const ad = await TeacherAd.findById(teacherAdId).lean();
      if (!ad) return res.status(404).json({ message: "Teacher ad not found" });
      teacherUser = ad.owner;
    }

    const booking = await Booking.create({
      user: req.user._id,
      teacher: teacherId || null,
      teacherAd: teacherAdId || null,
      teacherUser,
      reason,
      fullName,
      email,
      phone,
      scheduledAt,
    });

    const populated = await Booking.findById(booking._id)
      .populate("teacher", "name surname avatar_url languages price_per_hour")
      .populate(
        "teacherAd",
        "name surname avatar_url languages price_per_hour",
      );

    if (teacherUser) {
      await notify({
        recipient: teacherUser,
        type: "booking_new",
        message: `New booking from ${fullName} for ${new Date(scheduledAt).toLocaleString()}`,
        booking: booking._id,
        teacherAd: teacherAdId || null,
      });
    }

    res.status(201).json({ booking: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "This time slot is already booked." });
    }
    next(err);
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
          "You can only edit a booking while it is pending (not yet confirmed or cancelled).",
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
        teacherAdId: booking.teacherAd,
        teacherId: booking.teacher,
        scheduledAt,
        excludeBookingId: booking._id,
      });
      if (conflict) {
        return res
          .status(409)
          .json({ message: "This time slot is already booked." });
      }
      booking.scheduledAt = scheduledAt;
    }

    if (reason) booking.reason = reason;
    if (fullName) booking.fullName = fullName;
    if (email) booking.email = email;
    if (phone) booking.phone = phone;

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("teacher", "name surname avatar_url languages price_per_hour")
      .populate(
        "teacherAd",
        "name surname avatar_url languages price_per_hour",
      );

    res.json({ booking: populated });
  } catch (err) {
    next(err);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.teacherStatus !== "pending") {
      return res.status(400).json({
        message:
          "You can only cancel a pending booking. Once confirmed, ask the teacher to cancel.",
      });
    }

    booking.teacherStatus = "cancelled";
    booking.cancelledBy = "student";
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    next(err);
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
    })
      .populate("user", "name surname email")
      .populate("teacherAd", "name surname price_per_hour");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.teacherStatus !== "pending") {
      return res
        .status(400)
        .json({ message: `Booking is already ${booking.teacherStatus}` });
    }

    booking.teacherStatus = "confirmed";
    booking.teacherMessage = req.body.message || "";
    await booking.save();

    const teacherName = booking.teacherAd
      ? `${booking.teacherAd.name} ${booking.teacherAd.surname}`
      : "Your teacher";
    await notify({
      recipient: booking.user._id,
      type: "booking_confirmed",
      message:
        `${teacherName} confirmed your lesson on ${new Date(booking.scheduledAt).toLocaleString()}` +
        (booking.teacherMessage ? `: "${booking.teacherMessage}"` : "."),
      booking: booking._id,
      teacherAd: booking.teacherAd?._id || null,
    });

    const populated = await Booking.findById(booking._id)
      .populate("user", "name surname email")
      .populate(
        "teacherAd",
        "name surname avatar_url languages price_per_hour",
      );

    res.json({ booking: populated });
  } catch (err) {
    next(err);
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
    })
      .populate("user", "name surname email")
      .populate("teacherAd", "name surname");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.teacherStatus === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }
    if (booking.teacherStatus === "completed") {
      return res
        .status(400)
        .json({ message: "Cannot cancel a completed lesson" });
    }

    booking.teacherStatus = "cancelled";
    booking.cancelledBy = "teacher";
    booking.teacherMessage = req.body.message || "";
    await booking.save();

    const teacherName = booking.teacherAd
      ? `${booking.teacherAd.name} ${booking.teacherAd.surname}`
      : "Your teacher";
    await notify({
      recipient: booking.user._id,
      type: "booking_cancelled",
      message:
        `${teacherName} cancelled your lesson on ${new Date(booking.scheduledAt).toLocaleString()}` +
        (booking.teacherMessage ? `: "${booking.teacherMessage}"` : "."),
      booking: booking._id,
      teacherAd: booking.teacherAd?._id || null,
    });

    const populated = await Booking.findById(booking._id)
      .populate("user", "name surname email")
      .populate(
        "teacherAd",
        "name surname avatar_url languages price_per_hour",
      );

    res.json({ booking: populated });
  } catch (err) {
    next(err);
  }
};

const completeBooking = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only teachers can complete bookings" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      teacherUser: req.user._id,
    })
      .populate("user", "name surname email")
      .populate(
        "teacherAd",
        "name surname price_per_hour lessons_done total_earned",
      );

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.teacherStatus !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be marked as completed.",
      });
    }

    const price = booking.teacherAd?.price_per_hour ?? 0;

    booking.teacherStatus = "completed";
    booking.earnedAmount = price;
    booking.teacherMessage = req.body.message || "";
    await booking.save();

    if (booking.teacherAd) {
      await TeacherAd.findByIdAndUpdate(booking.teacherAd._id, {
        $inc: { lessons_done: 1, total_earned: price },
      });
    }

    const teacherName = booking.teacherAd
      ? `${booking.teacherAd.name} ${booking.teacherAd.surname}`
      : "Your teacher";
    await notify({
      recipient: booking.user._id,
      type: "lesson_completed",
      message: `Your lesson with ${teacherName} is complete! Share your experience by leaving a review.`,
      booking: booking._id,
      teacherAd: booking.teacherAd?._id || null,
    });

    const populated = await Booking.findById(booking._id)
      .populate("user", "name surname email")
      .populate(
        "teacherAd",
        "name surname avatar_url languages price_per_hour",
      );

    res.json({ booking: populated });
  } catch (err) {
    next(err);
  }
};

const leaveReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "rating must be between 1 and 5" });
    }
    if (!comment?.trim()) {
      return res.status(400).json({ message: "comment is required" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("teacherAd")
      .populate("user", "name surname");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.teacherStatus !== "completed") {
      return res
        .status(400)
        .json({ message: "You can only review a completed lesson." });
    }
    if (booking.reviewLeft) {
      return res
        .status(400)
        .json({ message: "You have already left a review for this lesson." });
    }

    const ad = await TeacherAd.findById(booking.teacherAd._id);
    if (!ad) return res.status(404).json({ message: "Teacher ad not found" });

    ad.reviews.push({
      student: req.user._id,
      reviewer_name: req.user.name || booking.fullName,
      reviewer_rating: Number(rating),
      comment: comment.trim(),
      booking: booking._id,
    });

    const sum = ad.reviews.reduce((acc, r) => acc + r.reviewer_rating, 0);
    ad.rating = Math.round((sum / ad.reviews.length) * 10) / 10;

    await ad.save();

    booking.reviewLeft = true;
    await booking.save();

    await notify({
      recipient: ad.owner,
      type: "review_received",
      message: `${req.user.name || booking.fullName} left a ${rating}★ review on your ad "${ad.name} ${ad.surname}".`,
      booking: booking._id,
      teacherAd: ad._id,
    });

    res.json({
      message: "Review submitted",
      rating: ad.rating,
      reviews: ad.reviews,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  confirmBooking,
  cancelBookingByTeacher,
  completeBooking,
  leaveReview,
};
