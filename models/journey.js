const mongoose = require('mongoose');
const { Schema } = mongoose;

const JourneySchema = new Schema ({
  title: { type: String, maxLength:140, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  desc: { type: String, default: 'Add a new description' },
  timestamp: { type: Date, default: new Date() },
  dueDate: { type: Date }, // Optional due date
  participants: [{ type: String }],
  likedBy: [{ type: String }],
  tags: { type: Array, default: [] }, // Not implemented
  privacy: { type: Number, min: 0, max: 2, default: 0 } // 0 - Public, 1 - Friends-only, 2 - Private
}, { versionKey: false });

// Virtual for journey URL, used for redirects
JourneySchema
  .virtual('url')
  .get(function() {
    return '/journeys/' + this._id;
  });

module.exports = mongoose.model('Journey', JourneySchema);