const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewer_name: { type: String, required: true },
    reviewer_rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
  },
  { timestamps: true },
);

const teacherAdSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: { type: String, required: true, trim: true },
    surname: { type: String, required: true, trim: true },

    languages: {
      type: [String],
      required: [true, "At least one language is required"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
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
      min: [1, "Price must be at least $1"],
    },

    avatar_url: { type: String, default: "" },
    lesson_info: { type: String, default: "" },
    conditions: { type: [String], default: [] },
    experience: { type: String, default: "" },

    rating: { type: Number, default: 0, min: 0, max: 5 },

    reviews: { type: [reviewSchema], default: [] },

    lessons_done: { type: Number, default: 0, min: 0 },
    total_earned: { type: Number, default: 0, min: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

teacherAdSchema.index({ owner: 1 });
teacherAdSchema.index({ languages: 1 });
teacherAdSchema.index({ levels: 1 });
teacherAdSchema.index({ price_per_hour: 1 });
teacherAdSchema.index({ rating: -1 });
teacherAdSchema.index({ isActive: 1 });

teacherAdSchema.methods.recalcRating = async function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.reviewer_rating, 0);
    this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
  }
  await this.save();
};

module.exports = mongoose.model("TeacherAd", teacherAdSchema);
