// controllers/orderController.js
const Order = require('../models/Order');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { isEmail } = require('validator');

// create Order
const createOrder = async (req, res) => {
  try {
    const { cart, total, paymentMethod, billingDetails, userEmail, userId, shippedAt, deliveredAt } = req.body;

    // Validate email address
    if (!isEmail(userEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Prepare order data
    const orderData = {
      userId,
      books: cart.map((item) => ({
        bookId: item.bookId, 
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      paymentMethod,
      billingDetails,
      shippedAt,
      deliveredAt,
    };

    // Create and save the order
    const order = new Order(orderData);
    const savedOrder = await order.save();

    // console.log('orderId:', savedOrder._id);

    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: userEmail,
      subject: 'Order Confirmation',
      html: `
    <html>
      <head>
        <style>
          /* Inline styles for consistent rendering */
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
        </style>
      </head>
      <body>
        <h1>Order Confirmation</h1>
        <p>Thank you for your order! Here are the details:</p>
        <p style="font-weight: bold; font-size: 1.5em; color: #ff3300; border: 2px solid #ff3300; padding: 5px;">Order ID: ${savedOrder._id}</p> <!-- Convert ObjectId to string -->
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${cart.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p>Total: ${total}</p>
      </body>
    </html>
  `,
};

    // Send order details via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email not sent:', error);
        return res.status(500).json({ error: 'Failed to send order confirmation email' });
      } else {
        console.log('Email sent:', info.response);
        console.log('Order confirmation email sent');
        res.status(201).json(savedOrder);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const sendOrderDetailsToEmail = async (req, res) => {
  try {
    const { orderId, userEmail } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }

    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: userEmail,
      subject: `Order Details (Order ID: ${orderId})`,
      html: `
<html>
  <head>
    <style>
      /* Inline styles for consistent rendering */
      table {
        border-collapse: collapse;
        width: 100%;
      }
      th, td {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
      }
    </style>
  </head>
  <body>
    <h1>Order Details (Order ID: ${orderId})</h1> <!-- Check this line -->
    <p>Here are the details of your order:</p>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${order.books.map(book => `
          <tr>
            <td>${book.title}</td>
            <td>${book.quantity}</td>
            <td>${book.price}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p>Total: ${order.total}</p>
  </body>
</html>
`,
    };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email not sent:', error);
        return res.status(500).json({ error: 'Failed to send order details email' });
      } else {
        console.log('Email sent:', info.response);
        console.log('Order details email sent');
        res.status(200).json({ message: 'Order details sent to email.' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, userId } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }  
  if (status === 'shipped') {
    if (order.status !== 'shipped') { 
      order.status = 'shipped';
      order.shippedAt = new Date(); 
      await order.save();
    }
  } else if (status === 'delivered') {
    if (order.status === 'shipped') { 
      order.status = 'delivered';
      order.deliveredAt = new Date(); 
      await order.save();
    }
  }
    res.status(200).json({ status: order.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'No orders found' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId; 
   
    const userOrders = await Order.find({ userId });

    res.status(200).json(userOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const addFeedback = async (req, res) => {
  try {
    const { orderId, bookId, rating, comments } = req.body;
    console.log('Received feedback data:', { orderId, bookId, rating, comments });

    const order = await Order.findById(orderId);

    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ error: 'Order not found' });
    }

    // Find the book within the order using bookId
    const book = order.books.find((book) => book.bookId.toString() === bookId);

    if (!book) {
      console.log('Book not found in the order');
      return res.status(404).json({ error: 'Book not found in the order' });
    }

    // Check if the order has been delivered before allowing feedback
    if (order.status !== 'delivered') {
      console.log('Order is not delivered, cannot add feedback');
      return res.status(400).json({ error: 'Feedback can only be added for delivered orders' });
    }

    // Update the book with the provided feedback
    book.rating = rating;
    book.comments = comments;
    await order.save();

    console.log('Feedback added successfully');
    res.status(200).json({ message: 'Feedback added successfully' });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    if (orderId === 'delete-all') { // Check if the request is to delete all orders
      await Order.deleteMany({});
      return res.status(204).send(); // Respond with a 204 No Content status code on successful deletion of all orders
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Perform the deletion of the specific order
    await Order.findByIdAndRemove(orderId);

    res.status(204).send(); // Respond with a 204 No Content status code on successful deletion of the specific order.
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const deleteAllOrders = async (req, res) => {
  try {
    await Order.deleteMany({});
    res.status(204).send(); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = {
    createOrder,
    sendOrderDetailsToEmail,
    updateOrderStatus,
    getAllOrders,
    getOrderById,
    addFeedback,
    deleteOrder,
    deleteAllOrders,
    getUserOrders,
};