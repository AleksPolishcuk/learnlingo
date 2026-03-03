const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favorite.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFavorites);
router.post('/:teacherId', protect, addFavorite);
router.delete('/:teacherId', protect, removeFavorite);

module.exports = router;
