const express = require("express");
const router = express.Router();
const {
  getTeacherAdds,
  getTeacherAddById,
  getMyAdd,
  createTeacherAdd,
  updateTeacherAdd,
  deleteTeacherAdd,
} = require("../controllers/teacherAdd.controller");
const { protect } = require("../middleware/auth");

router.get("/", getTeacherAdds);
router.get("/:id", getTeacherAddById);

router.get("/my/add", protect, getMyAdd);
router.post("/", protect, createTeacherAdd);
router.put("/:id", protect, updateTeacherAdd);
router.delete("/:id", protect, deleteTeacherAdd);

module.exports = router;
