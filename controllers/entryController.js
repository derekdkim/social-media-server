const Entry = require('../models/entry');
const Journey = require('../models/journey');
const Comment = require('../models/comment');
const async = require('async');

// Create New Entry
exports.createEntry = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

  Journey.findById(req.params.journeyID)
    .populate('author')
    .exec((err, journey) => {
      if (err) { return next(err); }

      // Check if user is a participant or author of parent journey
      if (journey.participants.includes(req.user.uuid) || journey.author.uuid === req.user.uuid) {
        const newEntry = new Entry ({
          parent: journey,
          text: req.body.text,
          author: req.user,
          timestamp: new Date()
        });

        newEntry.save(err => {
          if (err) { return next(err); }
          // Success
          res.json({ message: 'success', entry: newEntry });
        });
      } else {
        res.json({ message: 'User must be a participant or author to create an entry in this journey' });
      }
    });
}

// Edit Entry
exports.editEntry = (req, res, next) => {
  Entry.findById(req.params.entryID)
    .populate('author')
    .exec((err, entry) => {
      if (err) { return next(err); }

      if (req.user.uuid === entry.author.uuid) {
        const changedEntry = {
          text: req.body.text,
          _id: req.params.entryID
        };

        Entry.findByIdAndUpdate(req.params.entryID, changedEntry, { new: true }, function (err, result) {
          if (err) { return next(err); }
          // Success
          res.json({ message: 'success', entry: result });
        });
      } else {
        res.json ({ message: 'Permission denied: User is not the author.', entry: entry.author._id, user: req.user._id, result: entry.author._id === req.user._id });
      }
    });
}

// Delete Entry
exports.deleteEntry = (req, res, next) => {
  Entry.findById(req.params.entryID)
    .populate('author')
    .exec((err, entry) => {
      if (err) { return next(err); }

      if (req.user.uuid === entry.author.uuid) {
        let commentCount = 0;
        async.series([
          function(callback) {
            Comment.deleteMany({ parent: req.params.entryID }, (err, result) => {
              if (err) { return next(err); }

              if (result.deletedCount > 0) {
                commentCount += result.deletedCount;
                callback(null);
              }
            });
          },
          function(callback) {
            Entry.findByIdAndDelete(req.params.entryID).exec(callback);
          }
        ], 
        function (err, result) {
          if (err) { return next(err); }

          res.json({ message: 'success', commentCount: commentCount });
        });
      } else {
        res.json ({ message: 'Permission denied: User is not the author.'});
      }
    });
}

// Display All Entries
exports.displayEntries = (req, res, next) => {
  Entry.find({ parent: req.params.journeyID })
    .populate('author')
    .populate('parent')
    .sort(['timestamp', 'descending'])
    .exec((err, entries) => {
      if (err) { return next(err); }
      // Success
      res.json(entries);
    })
    .catch(err => {
      res.json(err);
    });
}

// Like entry
exports.likeEntry = async (req, res, next) => {
  // Fetch entry in question
  Entry.findById(req.params.entryID)
    .exec((err, entry) => {
      if (err) { return next(err); }

      // Only proceed if user has not yet liked this entry
      if (entry.likedBy.includes(req.user.uuid)) {
        res.json({ message: 'This user has already liked this entry.'});
      } else {
        // Push requesting user's uuid to the likedBy array to prevent duplicate likes from the same user
        Entry.findByIdAndUpdate(req.params.entryID, { $push: { likedBy: req.user.uuid} }, { new: true }, (err, result) => {
          if (err) { return next(err); }

          res.json({ message: 'success', likedBy: result.likedBy, likedCount: result.likedBy.length });
        });
      }
    });
}

// Unlike entry
exports.unlikeEntry = async (req, res, next) => {
  // Fetch entry in question
  Entry.findById(req.params.entryID)
    .exec((err, entry) => {
      if (err) { return next(err); }

      // Only proceed if user has not yet liked this entry
      if (entry.likedBy.includes(req.user.uuid)) {
        // Pull requesting user's uuid from the likedBy array
        Entry.findByIdAndUpdate(req.params.entryID, { $pull: { likedBy: req.user.uuid} }, { new: true }, (err, result) => {
          if (err) { return next(err); }

          res.json({ message: 'success', likedBy: result.likedBy, likedCount: result.likedBy.length });
        });
      } else {
        res.json({ message: 'This user has not liked this entry.'});
      }
    });
}