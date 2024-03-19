const User = require('../models/User');
// const Profile = require('../models/Profile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');



// Function to generate a random token
const generateToken = () => {
  return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
};


const sendEmail = async (email, resetToken) => {
  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    // Your SMTP settings here
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Email content with HTML formatting and inline CSS styling
  const mailOptions = {
    from: process.env.SMTP_USERNAME,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding-bottom: 20px;">
            <img src="https://example.com/logo.png" alt="Logo" style="max-width: 200px; height: auto;">
          </div>
          <div style="background-color: #ffffff; border-radius: 8px; padding: 20px;">
            <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
            <p style="font-size: 16px; color: #555; text-align: center;">You've requested to reset your password. Click the button below to proceed.</p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="https://eboook.netlify.app/reset-password/${resetToken}" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 18px;">Reset Password</a>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <p style="font-size: 14px; color: #777;">If you have trouble clicking the button above, you can also <a href="https://eboook.netlify.app/reset-password/${resetToken}" style="color: #007bff; text-decoration: none;">reset your password here</a>.</p>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <p style="font-size: 14px; color: #777;">If you didn't request a password reset, you can ignore this email.</p>
            <p style="font-size: 14px; color: #777;">For any questions or assistance, please contact our support team at <a href="mailto:support@example.com" style="color: #007bff; text-decoration: none;">support@example.com</a>.</p>
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <p style="font-size: 14px; color: #999;">This email was sent by YourAppName. To learn more about us, visit our <a href="https://example.com" style="color: #007bff; text-decoration: none;">website</a>.</p>
          </div>
        </div>
      </div>
    `,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};





const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  // Input sanitization and validation
  await body('username').trim().escape().isLength({ min: 1 }).withMessage('Username is required').run(req);
  await body('email').trim().escape().isEmail().withMessage('Invalid email').run(req);
  await body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .run(req);
  await body('role').trim().escape().optional().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword, role });
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};





const loginUser = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    // Log login attempt
    logger.info(`Login attempt for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      // Log failed login attempt
      logger.warn(`Login failed for email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    if (!(await bcrypt.compare(password, user.password))) {
      // Log failed login attempt
      logger.warn(`Login failed for email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Log successful login attempt
    logger.info(`Login successful for email: ${email}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send token in response
    res.json({ token });
  } catch (error) {
    logger.error(`Error during login for email: ${email}, error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};





const getProfile = async (req, res) => {
  const { userId, username, role, profilePhotoUrl } = req.user;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Additional data retrieval logic, if needed
    // const additionalData = await retrieveAdditionalData(userId);

    res.json({
      userId,
      username,
      role,
      profilePhotoUrl: user.profilePhotoUrl,
      // additionalProfileData: additionalData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const updateProfile = async (req, res) => {
  const { userId } = req.user;
  const { username, email, role, profilePhotoUrl } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (profilePhotoUrl) user.profilePhotoUrl = profilePhotoUrl;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate and store reset token
    const token = generateToken();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send reset password email
    await sendEmail(email, token);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Input validation using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find user by reset token
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};






// // Reset password controller
// const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     // Find user by reset token
//     const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     // Update password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     user.password = hashedPassword;
//     user.resetPasswordToken = null;
//     user.resetPasswordExpires = null;
//     await user.save();

//     res.status(200).json({ message: 'Password reset successfully' });
//   } catch (error) {
//     console.error('Error resetting password:', error);
//     res.status(500).json({ error: 'Failed to reset password' });
//   }
// };





module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
};




