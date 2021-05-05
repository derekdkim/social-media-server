const mongoose = require('mongoose');
const { Schema } = mongoose;

const EntrySchema = new Schema ({
  text: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: new Date() },
  comments: { type: Array, default: [] },
  likedBy: { type: Array, default: [] }
});

module.exports = mongoose.model('Entry', EntrySchema);