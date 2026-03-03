const User = require("../models/User");

const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    res.json({ favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favorites: req.params.teacherId } },
      { new: true },
    ).populate("favorites");
    res.json({ favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: req.params.teacherId } },
      { new: true },
    ).populate("favorites");
    res.json({ favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };
