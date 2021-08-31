const mongoose = require('mongoose');
const { Schema } = mongoose;
const UUID = require('uuid-1345');

const CommentSchema = new Schema({
  parent: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
  text: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: new Date() },
  likedBy: [{ type: String }],
}, { versionKey: false });

module.exports = mongoose.model('Comment', CommentSchema);