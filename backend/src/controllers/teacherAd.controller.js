const TeacherAd = require("../models/TeacherAd");

const ALLOWED_LEVELS = [
  "A1 Beginner",
  "A2 Elementary",
  "B1 Intermediate",
  "B2 Upper-Intermediate",
  "C1 Advanced",
  "C2 Proficient",
];

const validateAdBody = (body) => {
  const { name, surname, languages, levels, price_per_hour } = body;
  if (!name?.trim()) return "name is required";
  if (!surname?.trim()) return "surname is required";
  if (!Array.isArray(languages) || languages.length === 0)
    return "At least one language is required";
  if (!Array.isArray(levels) || levels.length === 0)
    return "At least one level is required";
  const badLevel = levels.find((l) => !ALLOWED_LEVELS.includes(l));
  if (badLevel) return `Invalid level: "${badLevel}"`;
  const price = Number(price_per_hour);
  if (!price_per_hour || isNaN(price) || price < 1)
    return "price_per_hour must be a positive number";
  return null;
};

const getTeacherAds = async (req, res, next) => {
  try {
    const { language, level, price, sortBy, page = 1, limit = 4 } = req.query;

    const filter = { isActive: true };
    if (language) filter.languages = { $in: [language] };
    if (level) filter.levels = { $in: [level] };
    if (price) filter.price_per_hour = { $lte: Number(price) };

    let sort = { rating: -1 };
    if (sortBy === "price_asc") sort = { price_per_hour: 1 };
    if (sortBy === "price_desc") sort = { price_per_hour: -1 };
    if (sortBy === "newest") sort = { createdAt: -1 };
    if (sortBy === "oldest") sort = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [ads, total] = await Promise.all([
      TeacherAd.find(filter)
        .populate("owner", "name email")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      TeacherAd.countDocuments(filter),
    ]);

    res.json({
      teachers: ads,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      hasMore: skip + ads.length < total,
    });
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
  }
};

const getMyAds = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can manage ads" });
    }
    const ads = await TeacherAd.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ ads });
  } catch (err) {
    next(err);
  }
};

const createTeacherAd = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can create ads" });
    }

    const err = validateAdBody(req.body);
    if (err) return res.status(400).json({ message: err });

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

    const ad = await TeacherAd.create({
      owner: req.user._id,
      name: name.trim(),
      surname: surname.trim(),
      languages,
      levels,
      price_per_hour: Number(price_per_hour),
      avatar_url: avatar_url || "",
      lesson_info: lesson_info || "",
      conditions: conditions || [],
      experience: experience || "",
    });

    res.status(201).json({ ad });
  } catch (err) {
    next(err);
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

    const partial = { ...ad.toObject(), ...req.body };
    const err = validateAdBody(partial);
    if (err) return res.status(400).json({ message: err });

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
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) ad[f] = req.body[f];
    });

    await ad.save();
    res.json({ ad });
  } catch (err) {
    next(err);
  }
};

const toggleTeacherAd = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can toggle ads" });
    }

    const ad = await TeacherAd.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!ad)
      return res.status(404).json({ message: "Ad not found or not yours" });

    ad.isActive = !ad.isActive;
    await ad.save();

    res.json({ ad, isActive: ad.isActive });
  } catch (err) {
    next(err);
  }
};

const deleteTeacherAd = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can delete ads" });
    }

    const ad = await TeacherAd.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!ad)
      return res.status(404).json({ message: "Ad not found or not yours" });

    const Booking = require("../models/Booking");
    const activeBookings = await Booking.countDocuments({
      teacherAd: ad._id,
      teacherStatus: { $in: ["pending", "confirmed"] },
    });
    if (activeBookings > 0) {
      return res.status(400).json({
        message: `Cannot delete this ad — it has ${activeBookings} active booking(s). Cancel or complete them first.`,
      });
    }

    await TeacherAd.findByIdAndDelete(ad._id);
    res.json({ message: "Ad deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTeacherAds,
  getTeacherAdById,
  getMyAds,
  createTeacherAd,
  updateTeacherAd,
  toggleTeacherAd,
  deleteTeacherAd,
};
