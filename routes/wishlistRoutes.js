const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

router.post('/add', wishlistController.addToWishlist);

router.delete('/remove/:userId/:bookId', wishlistController.removeFromWishlist);

router.get('/get/:userId', wishlistController.getUserWishlist);

module.exports = router;




