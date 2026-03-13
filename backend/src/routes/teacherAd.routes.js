// teacherAd.routes.js
const express = require("express");
const router = express.Router();
const {
  getTeacherAds,
  getTeacherAdById,
  getMyAds,
  createTeacherAd,
  updateTeacherAd,
  toggleTeacherAd,
  deleteTeacherAd,
} = require("../controllers/teacherAd.controller");
const { protect } = require("../middleware/auth");

router.get("/", getTeacherAds);

router.get("/my/ads", protect, getMyAds);

router.get("/:id", getTeacherAdById);
router.post("/", protect, createTeacherAd);
router.put("/:id", protect, updateTeacherAd);
router.patch("/:id/toggle", protect, toggleTeacherAd);
router.delete("/:id", protect, deleteTeacherAd);

module.exports = router;
