const TeacherAdd = require("../models/TeacherAdd");

const getTeacherAdds = async (req, res, next) => {
  try {
    const { language, level, price, page = 1, limit = 4 } = req.query;

    const filter = { isActive: true };
    if (language) filter.languages = { $in: [language] };
    if (level) filter.levels = { $in: [level] };
    if (price) filter.price_per_hour = { $lte: Number(price) };

    const skip = (Number(page) - 1) * Number(limit);

    const [adds, total] = await Promise.all([
      TeacherAdd.find(filter)
        .populate("owner", "name email")
        .skip(skip)
        .limit(Number(limit))
        .sort({ rating: -1 }),
      TeacherAdd.countDocuments(filter),
    ]);

    res.json({
      teachers: adds,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      hasMore: skip + adds.length < total,
    });
  } catch (error) {
    next(error);
  }
};

const getTeacherAddById = async (req, res, next) => {
  try {
    const ad = await TeacherAdd.findById(req.params.id).populate(
      "owner",
      "name email",
    );
    if (!ad) return res.status(404).json({ message: "Teacher add not found" });
    res.json({ teacher: ad });
  } catch (error) {
    next(error);
  }
};

const getMyAdd = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can manage adds" });
    }
    const ad = await TeacherAdd.findOne({ owner: req.user._id });
    res.json({ ad: ad || null });
  } catch (error) {
    next(error);
  }
};

const createTeacherAdd = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can create adds" });
    }

    const existing = await TeacherAdd.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({
        message: "You already have an active add. Use PUT to update it.",
      });
    }

    const {
      name,
      surname,
      languages,
      levels,
      price_per_hour,
      avatar_url,
      lesson_info,
      conditions,
      experience,
    } = req.body;

    if (
      !name ||
      !surname ||
      !languages?.length ||
      !levels?.length ||
      !price_per_hour
    ) {
      return res.status(400).json({
        message:
          "name, surname, languages, levels and price_per_hour are required",
      });
    }

    const add = await TeacherAdd.create({
      owner: req.user._id,
      name,
      surname,
      languages,
      levels,
      price_per_hour,
      avatar_url: avatar_url || "",
      lesson_info: lesson_info || "",
      conditions: conditions || [],
      experience: experience || "",
    });

    res.status(201).json({ add });
  } catch (error) {
    next(error);
  }
};

const updateTeacherAdd = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can update adds" });
    }

    const add = await TeacherAdd.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!ad)
      return res.status(404).json({ message: "Add not found or not yours" });

    const allowed = [
      "name",
      "surname",
      "languages",
      "levels",
      "price_per_hour",
      "avatar_url",
      "lesson_info",
      "conditions",
      "experience",
      "isActive",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) add[field] = req.body[field];
    });

    await ad.save();
    res.json({ add });
  } catch (error) {
    next(error);
  }
};

const deleteTeacherAdd = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can delete adds" });
    }

    const ad = await TeacherAdd.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!ad)
      return res.status(404).json({ message: "Add not found or not yours" });

    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeacherAdds,
  getTeacherAddById,
  getMyAdd,
  createTeacherAdd,
  updateTeacherAdd,
  deleteTeacherAdd,
};
