const Wishlist = require('../models/Wishlist');

const addToWishlist = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { books: bookId } }, // Add bookId to wishlist if not already present
      { new: true, upsert: true }
    );
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const removeFromWishlist = async (req, res) => {
    try {
      const { userId, bookId } = req.params;
      if (!userId || !bookId) {
        return res.status(400).json({ error: "Both userId and bookId are required." });
      }
  
      const wishlist = await Wishlist.findOneAndUpdate(
        { userId },
        { $pull: { books: bookId } },
        { new: true }
      );
      res.json(wishlist);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  

const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.findOne({ userId }).populate('books');
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist
};







