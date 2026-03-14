const User = require("../models/User");
const TeacherAd = require("../models/TeacherAd");

const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("favorites")
      .populate("favoriteAds");

    const teachers = (user.favorites ?? []).map((t) => ({
      ...t.toObject(),
      _kind: "Teacher",
    }));
    const ads = (user.favoriteAds ?? []).map((a) => ({
      ...a.toObject(),
      _kind: "TeacherAd",
    }));

    res.json({ favorites: [...teachers, ...ads] });
  } catch (error) {
    next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const kind = req.body?.kind === "TeacherAd" ? "TeacherAd" : "Teacher";

    const field = kind === "TeacherAd" ? "favoriteAds" : "favorites";

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { [field]: teacherId } },
      { new: true },
    )
      .populate("favorites")
      .populate("favoriteAds");

    const teachers = (user.favorites ?? []).map((t) => ({
      ...t.toObject(),
      _kind: "Teacher",
    }));
    const ads = (user.favoriteAds ?? []).map((a) => ({
      ...a.toObject(),
      _kind: "TeacherAd",
    }));

    res.json({ favorites: [...teachers, ...ads] });
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          favorites: teacherId,
          favoriteAds: teacherId,
        },
      },
      { new: true },
    )
      .populate("favorites")
      .populate("favoriteAds");

    const teachers = (user.favorites ?? []).map((t) => ({
      ...t.toObject(),
      _kind: "Teacher",
    }));
    const ads = (user.favoriteAds ?? []).map((a) => ({
      ...a.toObject(),
      _kind: "TeacherAd",
    }));

    res.json({ favorites: [...teachers, ...ads] });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };
