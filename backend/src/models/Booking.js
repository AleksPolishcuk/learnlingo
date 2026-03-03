const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'Career and business',
        'Lesson for kids',
        'Living abroad',
        'Exams and coursework',
        'Culture, travel or hobby',
      ],
    },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
    scheduledAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
