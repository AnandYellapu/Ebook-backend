// const CartItem = require('../models/CartItem');
// const mongoose = require('mongoose');



// // Controller to add an item to the shopping cart
// const addToCart = async (req, res) => {
//   try {
//     const { bookId, title, price, quantity } = req.body;

//     // Check if the received bookId is a valid ObjectId
//     const isValidObjectId = mongoose.Types.ObjectId.isValid(bookId);

//     // If bookId is not a valid ObjectId, return an error response
//     if (!isValidObjectId) {
//       return res.status(400).json({ error: 'Invalid bookId' });
//     }

//     // Check if the item with the same bookId already exists in the cart
//     const existingItem = await CartItem.findOne({ bookId: bookId });

//     // If the item already exists, return an error response
//     if (existingItem) {
//       return res.status(400).json({ error: 'Item already exists in the cart' });
//     }

//     // Create a new CartItem with the received bookId
//     const newItem = new CartItem({
//       bookId: new mongoose.Types.ObjectId(bookId),
//       title,
//       price,
//       quantity: quantity || 1,
//     });

//     const savedItem = await newItem.save();

//     res.status(201).json(savedItem);
//   } catch (error) {
//     console.error('Error adding item to cart:', error);
//     res.status(500).json({ error: 'Could not add item to cart' });
//   }
// };





// // Controller to remove an item from the shopping cart
// const removeFromCart = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const removedItem = await CartItem.findOneAndDelete({ _id: id });
//     if (!removedItem) {
//       return res.status(404).json({ error: 'Item not found in cart' });
//     }
//     res.json(removedItem);
//   } catch (error) {
//     console.error('Error removing item from cart:', error);
//     res.status(500).json({ error: 'Could not remove item from cart' });
//   }
// };




// // Controller to update the quantity of an item in the shopping cart
// const updateQuantity = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { quantity } = req.body;
//     const updatedItem = await CartItem.findByIdAndUpdate(id, { quantity }, { new: true });
//     if (!updatedItem) {
//       return res.status(404).json({ error: 'Item not found in cart' });
//     }
//     res.json(updatedItem);
//   } catch (error) {
//     console.error('Error updating item quantity:', error);
//     res.status(500).json({ error: 'Could not update item quantity' });
//   }
// };



// // Controller to get all items in the shopping cart
// const getCartItems = async (req, res) => {
//   try {
//     const cartItems = await CartItem.find();
//     res.json(cartItems);
//   } catch (error) {
//     console.error('Error fetching cart items:', error);
//     res.status(500).json({ error: 'Could not fetch cart items' });
//   }
// };




// const clearCart = async (req, res) => {
//   try {
//     await CartItem.deleteMany({});
//     res.json({ message: 'Cart cleared successfully' });
//   } catch (error) {
//     console.error('Error clearing cart:', error);
//     res.status(500).json({ error: 'Could not clear cart' });
//   }
// };


// module.exports ={
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     getCartItems,
//     clearCart,
// }











const CartItem = require('../models/CartItem');

// Controller to fetch cart items for a specific user
const getUserCartItems = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartItems = await CartItem.find({ userId });
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching user cart items:', error);
    res.status(500).json({ error: 'Could not fetch user cart items' });
  }
};



// Controller to add an item to the shopping cart for a specific user
const addToCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { bookId, title, price, quantity } = req.body;
    
    // Find existing cart item for the specified user and book
    let existingItem = await CartItem.findOne({ userId, bookId });
    
    if (existingItem) {
      // If the item already exists, return with an error message
      return res.status(400).json({ error: 'Item already exists in the cart' });
    }
    
    // If the item doesn't exist, create a new cart item
    const newItem = new CartItem({
      userId,
      bookId,
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


// Controller to remove an item from the shopping cart for a specific user
const removeFromCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { id } = req.params;
    // Remove the user's cart item by id
    const removedItem = await CartItem.findOneAndDelete({ _id: id, userId });
    if (!removedItem) {
      return res.status(404).json({ error: 'Item not found in user\'s cart' });
    }
    res.json(removedItem);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Could not remove item from cart' });
  }
};

// Controller to update the quantity of an item in the shopping cart for a specific user
const updateQuantity = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { id } = req.params;
    const { quantity } = req.body;
    // Update the user's cart item quantity by id
    const updatedItem = await CartItem.findByIdAndUpdate(id, { quantity }, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found in user\'s cart' });
    }
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ error: 'Could not update item quantity' });
  }
};


// Controller to clear the cart for a specific user
const clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Clear the user's cart items
    await CartItem.deleteMany({ userId });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Could not clear cart' });
  }
};


module.exports = {
  getUserCartItems,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
};
