const mongoose = require('mongoose');
const { Schema } = mongoose;

const JourneySchema = new Schema ({
  title: { type: String, maxLength:140 required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  desc: { type: String, default: 'Add a new description' },
  timestamp: { type: Date. default: new Date() },
  dueDate: { type: Date }, // Optional due date
  participants: { type: Array, default: [] },
  entries: { type: Array, default: [] },
  likedBy: { type: Array, default: [] },
  tags: { type: Array, default: [] }
});

module.exports = mongoose.model('Journey', JourneySchema);