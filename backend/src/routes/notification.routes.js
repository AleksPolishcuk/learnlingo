const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteAll,
} = require("../controllers/notification.controller");
const { protect } = require("../middleware/auth");

router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllRead);
router.delete("/all", protect, deleteAll);
router.patch("/:id/read", protect, markOneRead);

module.exports = router;
