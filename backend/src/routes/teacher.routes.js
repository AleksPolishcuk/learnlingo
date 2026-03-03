const express = require('express');
const router = express.Router();
const { getTeachers, getTeacherById } = require('../controllers/teacher.controller');

router.get('/', getTeachers);
router.get('/:id', getTeacherById);

module.exports = router;
