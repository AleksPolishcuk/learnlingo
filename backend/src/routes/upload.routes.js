const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");
const {
  uploadUserAvatar,
  uploadAdAvatar,
} = require("../controllers/upload.controller");

router.post("/avatar", protect, uploadAvatar, uploadUserAvatar);

router.post("/ad-avatar/:adId", protect, uploadAvatar, uploadAdAvatar);

module.exports = router;
