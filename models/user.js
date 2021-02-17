const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, minLength: 6 },
  password: { type: String, required: true }, // Enforce min length of 8 at validation instead
  firstName: { type: String, required: true, minLength: 1 },
  lastName: { type: String, required: true, minLength: 1 },
  birthDate: { type: Date, required: true },
  signupDate: { type: Date, default: new Date() },
  currentFriends: { type: Array, default: [] },
  pendingFriends: { type: Array, default: [] }
});

module.exports = mongoose.model('User', UserSchema);