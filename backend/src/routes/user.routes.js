const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateMe,
  deleteMe,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth");

router.put("/me", protect, updateMe);
router.delete("/me", protect, deleteMe);

router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;
