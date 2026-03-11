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
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: { type: String, required: true, trim: true },

    scheduledAt: {
      type: Date,
      required: [true, "Scheduled date and time is required"],
    },

    teacherStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    cancelledBy: {
      type: String,
      enum: ["student", "teacher", null],
      default: null,
    },

    teacherMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

bookingSchema.index(
  { teacherAd: 1, scheduledAt: 1 },
  {
    unique: true,
    partialFilterExpression: {
      teacherAd: { $ne: null },
      teacherStatus: { $ne: "cancelled" },
    },
  },
);

bookingSchema.index(
  { teacher: 1, scheduledAt: 1 },
  {
    unique: true,
    partialFilterExpression: {
      teacher: { $ne: null },
      teacherStatus: { $ne: "cancelled" },
    },
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
