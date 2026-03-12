const express = require("express");
const router = express.Router();
const {
  getTeacherAds,
  getTeacherAdById,
  getMyAd,
  createTeacherAd,
  updateTeacherAd,
  deleteTeacherAd,
} = require("../controllers/teacherAd.controller");
const { protect } = require("../middleware/auth");

router.get("/", getTeacherAds);
router.get("/:id", getTeacherAdById);

router.get("/my/ad", protect, getMyAd);
router.post("/", protect, createTeacherAd);
router.put("/:id", protect, updateTeacherAd);
router.delete("/:id", protect, deleteTeacherAd);

module.exports = router;
