// user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profilePhotoUrl: { type: String },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
});

const User = mongoose.model('User', userSchema);

module.exports = User;



