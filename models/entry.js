const mongoose = require('mongoose');
const { Schema } = mongoose;
const UUID = require('uuid-1345');

const EntrySchema = new Schema ({
  parent: { type: Schema.Types.ObjectId, ref: 'Journey', required: true },
  text: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: new Date() },
  comments: { type: Array, default: [] },
  likedBy: { type: Array, default: [] }
}, { versionKey: false });

module.exports = mongoose.model('Entry', EntrySchema);