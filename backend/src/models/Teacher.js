const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewer_name: { type: String, required: true },
  reviewer_rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
});

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    surname: { type: String, required: true, trim: true },
    languages: { type: [String], required: true },
    levels: { type: [String], required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    reviews: [reviewSchema],
    price_per_hour: { type: Number, required: true, min: 0 },
    lessons_done: { type: Number, default: 0 },
    avatar_url: { type: String, default: "" },
    lesson_info: { type: String, default: "" },
    conditions: { type: [String], default: [] },
    experience: { type: String, default: "" },
  },
  { timestamps: true },
);

teacherSchema.index({ name: "text", surname: "text" });

module.exports = mongoose.model("Teacher", teacherSchema);
