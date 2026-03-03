const Teacher = require("../models/Teacher");

const getTeachers = async (req, res, next) => {
  try {
    const { language, level, price, page = 1, limit = 4 } = req.query;
    const filter = {};

    if (language) filter.languages = { $in: [language] };
    if (level) filter.levels = { $in: [level] };
    if (price) filter.price_per_hour = { $lte: Number(price) };

    const skip = (Number(page) - 1) * Number(limit);
    const [teachers, total] = await Promise.all([
      Teacher.find(filter).skip(skip).limit(Number(limit)).sort({ rating: -1 }),
      Teacher.countDocuments(filter),
    ]);

    res.json({
      teachers,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      hasMore: skip + teachers.length < total,
    });
  } catch (error) {
    next(error);
  }
};

const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json({ teacher });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTeachers, getTeacherById };
