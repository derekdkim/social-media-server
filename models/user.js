const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, minLength: 6, maxLength: 20 },
  password: { type: String, required: true }, // Enforce min length of 8 at validation instead
  firstName: { type: String, required: true, minLength: 1 },
  lastName: { type: String, required: true, minLength: 1 },
  birthDate: { type: Date, required: true },
  signupDate: { type: Date, default: new Date() },
  currentFriends: { type: Array, default: [] },
  requestSendTo: { type: Array, default: [] },
  pendingFriends: { type: Array, default: [] },
  profilePicUrl: { type: String }, // TODO: Cloudinary integration
  intro: { type: String, maxLength: 160, default: 'Share something about yourself.' }
});

// Hash password before saving to database
UserSchema.pre(
  'save',
  async function (next) {
    const user = this;
    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;
    next();
  }
);

module.exports = mongoose.model('User', UserSchema);