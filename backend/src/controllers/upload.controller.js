const User = require("../models/User");
const TeacherAd = require("../models/TeacherAd");
const { cloudinary } = require("../middleware/upload");

const uploadUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar_url: avatarUrl },
      { new: true },
    );

    res.json({ avatar_url: avatarUrl, user });
  } catch (err) {
    next(err);
  }
};

const uploadAdAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (req.user.role !== "business") {
      return res
        .status(403)
        .json({ message: "Only business accounts can update ad avatars" });
    }

    const ad = await TeacherAd.findOne({
      _id: req.params.adId,
      owner: req.user._id,
    });
    if (!ad) {
      return res.status(404).json({ message: "Ad not found or not yours" });
    }

    if (ad.avatar_url && ad.avatar_url.includes("cloudinary")) {
      try {
        const parts = ad.avatar_url.split("/");
        const fileName = parts[parts.length - 1].split(".")[0];
        const folder = parts[parts.length - 2];
        await cloudinary.uploader.destroy(`${folder}/${fileName}`);
      } catch {}
    }

    ad.avatar_url = req.file.path;
    await ad.save();

    res.json({ avatar_url: req.file.path, ad });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadUserAvatar, uploadAdAvatar };
