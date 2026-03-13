const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "booking_confirmed",
        "booking_cancelled",
        "lesson_completed",
        "review_received",
        "booking_new",
      ],
    },
    message: { type: String, required: true },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    teacherAd: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherAd",
      default: null,
    },

    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
