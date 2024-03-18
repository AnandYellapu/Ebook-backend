const CartItem = require('../models/CartItem');
const mongoose = require('mongoose');


// Controller to add an item to the shopping cart
const addToCart = async (req, res) => {
  try {
    const { bookId, title, price, quantity } = req.body;

    // Check if the received bookId is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(bookId);

    // If bookId is not a valid ObjectId, return an error response
    if (!isValidObjectId) {
      return res.status(400).json({ error: 'Invalid bookId' });
    }

    // Create a new CartItem with the received bookId
    const newItem = new CartItem({
      bookId: new mongoose.Types.ObjectId(bookId),
      title,
      price,
      quantity: quantity || 1, 
    });

    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Could not add item to cart' });
  }
};




// Controller to remove an item from the shopping cart
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const removedItem = await CartItem.findOneAndDelete({ _id: id });
    if (!removedItem) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    res.json(removedItem);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Could not remove item from cart' });
  }
};




// Controller to update the quantity of an item in the shopping cart
const updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updatedItem = await CartItem.findByIdAndUpdate(id, { quantity }, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ error: 'Could not update item quantity' });
  }
};



// Controller to get all items in the shopping cart
const getCartItems = async (req, res) => {
  try {
    const cartItems = await CartItem.find();
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Could not fetch cart items' });
  }
};


module.exports ={
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartItems,
}