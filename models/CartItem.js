
const mongoose = require('mongoose');

// Define the schema for the shopping cart item
const cartItemSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book', // Reference to the Book model
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1, // Default quantity is 1
  },
});

// Define the model for the shopping cart item
const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
