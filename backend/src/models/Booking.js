const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
    teacherAd: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherAd",
      default: null,
    },
    teacherUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reason: {
      type: String,
      required: true,
      enum: [
        "Career and business",
        "Lesson for kids",
        "Living abroad",
        "Exams and coursework",
        "Culture, travel or hobby",
      ],
    },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    phone: { type: String, required: true, trim: true },
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled date/time is required"],
    },

    teacherStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    cancelledBy: {
      type: String,
      enum: ["student", "teacher", null],
      default: null,
    },

    teacherMessage: { type: String, default: "" },

    earnedAmount: { type: Number, default: 0 },

    reviewLeft: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bookingSchema.index(
  { teacherAd: 1, scheduledAt: 1 },
  {
    unique: true,
    partialFilterExpression: {
      teacherAd: { $ne: null },
      teacherStatus: { $nin: ["cancelled"] },
    },
  },
);

bookingSchema.index(
  { teacher: 1, scheduledAt: 1 },
  {
    unique: true,
    partialFilterExpression: {
      teacher: { $ne: null },
      teacherStatus: { $nin: ["cancelled"] },
    },
  },
);

bookingSchema.index({ user: 1, scheduledAt: -1 });
bookingSchema.index({ teacherUser: 1, scheduledAt: -1 });
bookingSchema.index({ teacherStatus: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
