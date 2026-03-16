const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAvailability,
  updateWeeklySlots,
  addSpecialSlot,
  deleteSpecialSlot,
  addBlockedRange,
  deleteBlockedRange,
} = require("../controllers/calendar.controller");

const teacherOnly = (req, res, next) => {
  if (req.user?.role !== "business")
    return res.status(403).json({ message: "Teachers only" });
  next();
};

router.get("/", protect, teacherOnly, getAvailability);
router.put("/weekly", protect, teacherOnly, updateWeeklySlots);
router.post("/special", protect, teacherOnly, addSpecialSlot);
router.delete("/special/:slotId", protect, teacherOnly, deleteSpecialSlot);
router.post("/block", protect, teacherOnly, addBlockedRange);
router.delete("/block/:rangeId", protect, teacherOnly, deleteBlockedRange);

module.exports = router;
