// const express = require('express');
// const router = express.Router();
// const cartController = require('../controllers/cartController');


// // Route to get all items in the shopping cart
// router.get('/', cartController.getCartItems);


// // Route to add an item to the shopping cart
// router.post('/add', cartController.addToCart);

// // Route to update the quantity of an item in the shopping cart
// router.put('/update/:id', cartController.updateQuantity);

// // Route to remove an item from the shopping cart
// router.delete('/remove/:id', cartController.removeFromCart);


// //Route to clear the cart
// router.delete('/clear', cartController.clearCart);


// module.exports = router;










const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Route to get all items in the shopping cart for a specific user
router.get('/:userId', cartController.getUserCartItems);

// Route to add an item to the shopping cart for a specific user
router.post('/add/:userId', cartController.addToCart);

// Route to update the quantity of an item in the shopping cart for a specific user
router.put('/update/:userId/:id', cartController.updateQuantity);

// Route to remove an item from the shopping cart for a specific user
router.delete('/remove/:userId/:id', cartController.removeFromCart);

// Route to clear the cart for a specific user
router.delete('/clear/:userId', cartController.clearCart);

module.exports = router;

