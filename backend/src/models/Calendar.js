const mongoose = require("mongoose");

const weeklySlotSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: true },
);

const specialSlotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: true },
);

const blockedRangeSchema = new mongoose.Schema(
  {
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    label: { type: String, default: "Blocked" },
  },
  { _id: true },
);

const availabilitySchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    weeklySlots: { type: [weeklySlotSchema], default: [] },
    specialSlots: { type: [specialSlotSchema], default: [] },
    blockedRanges: { type: [blockedRangeSchema], default: [] },
    lessonDuration: { type: Number, default: 60 },
    timezone: { type: String, default: "UTC" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Availability", availabilitySchema);
