const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
  parent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: new Date() },
  likedBy: { type: Array, default: [] }
});

module.exports = mongoose.model('Comment', CommentSchema);