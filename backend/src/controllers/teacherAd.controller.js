const TeacherAd = require("../models/TeacherAd");

const getTeacherAds = async (req, res, next) => {
  try {
    const { language, level, price, page = 1, limit = 4 } = req.query;

    const filter = { isActive: true };
    if (language) filter.languages = { $in: [language] };
    if (level) filter.levels = { $in: [level] };
    if (price) filter.price_per_hour = { $lte: Number(price) };

    const skip = (Number(page) - 1) * Number(limit);

    const [ads, total] = await Promise.all([
      TeacherAd.find(filter)
        .populate("owner", "name email")
        .skip(skip)
        .limit(Number(limit))
        .sort({ rating: -1 }),
      TeacherAd.countDocuments(filter),
    ]);

    res.json({
      teachers: ads,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      hasMore: skip + ads.length < total,
    });
  } catch (error) {
    next(error);
  }
};

const getTeacherAdById = async (req, res, next) => {
  try {
    const ad = await TeacherAd.findById(req.params.id).populate(
      "owner",
      "name email",
    );
    if (!ad) return res.status(404).json({ message: "Teacher ad not found" });
    res.json({ teacher: ad });
  } catch (error) {
    next(error);
  }
};

const getMyAd = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can manage ads" });
    }
    const ad = await TeacherAd.findOne({ owner: req.user._id });
    res.json({ ad: ad || null });
  } catch (error) {
    next(error);
  }
};

const createTeacherAd = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can create ads" });
    }

    const existing = await TeacherAd.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({
        message: "You already have an active ad. Use PUT to update it.",
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

    const ad = await TeacherAd.create({
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

    res.status(201).json({ ad });
  } catch (error) {
    next(error);
  }
};

const updateTeacherAd = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can update ads" });
    }

    const ad = await TeacherAd.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!ad)
      return res.status(404).json({ message: "Ad not found or not yours" });

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
      if (req.body[field] !== undefined) ad[field] = req.body[field];
    });

    await ad.save();
    res.json({ ad });
  } catch (error) {
    next(error);
  }
};

const deleteTeacherAd = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can delete ads" });
    }

    const ad = await TeacherAd.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!ad)
      return res.status(404).json({ message: "Ad not found or not yours" });

    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeacherAds,
  getTeacherAdById,
  getMyAd,
  createTeacherAd,
  updateTeacherAd,
  deleteTeacherAd,
};
