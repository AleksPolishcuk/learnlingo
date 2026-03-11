const mongoose = require("mongoose");

const teacherAddSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: { type: String, required: true, trim: true },
    surname: { type: String, required: true, trim: true },

    languages: {
      type: [String],
      required: [true, "At least one language is required"],
      validate: {
        validator: (v) => v.length > 0,
        message: "At least one language is required",
      },
    },

    levels: {
      type: [String],
      required: [true, "At least one level is required"],
      enum: [
        "A1 Beginner",
        "A2 Elementary",
        "B1 Intermediate",
        "B2 Upper-Intermediate",
        "C1 Advanced",
        "C2 Proficient",
      ],
    },

    price_per_hour: {
      type: Number,
      required: [true, "Price per hour is required"],
      min: [1, "Price must be at least 1"],
    },

    avatar_url: { type: String, default: "" },

    lesson_info: { type: String, default: "" },

    conditions: { type: [String], default: [] },

    experience: { type: String, default: "" },

    rating: { type: Number, default: 0, min: 0, max: 5 },

    lessons_done: { type: Number, default: 0, min: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

teacherAddSchema.index({ languages: 1 });
teacherAddSchema.index({ levels: 1 });
teacherAddSchema.index({ price_per_hour: 1 });
teacherAddSchema.index({ rating: -1 });

module.exports = mongoose.model("TeacherAdd", teacherAddSchema);
