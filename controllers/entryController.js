const Entry = require('../models/entry');
const Journey = require('../models/journey');
const Comment = require('../models/comment');
const user = require('../models/user');

// Create New Entry
exports.createEntry = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

  Journey.findById(req.params.journeyID)
    .exec((err, journey) => {
      if (err) { return next(err); }

      const newEntry = new Entry ({
        parent: journey,
        text: req.body.text,
        author: req.user,
        timestamp: new Date()
      });

      newEntry.save(err => {
        if (err) { return next(err); }
        // Success
        res.json({entry: newEntry});
      });
    });
}

// Edit Entry
exports.editEntry = (req, res, next) => {
  Entry.findById(req.params.entryID)
    .populate('author')
    .exec((err, entry) => {
      if (err) { return next(err); }

      if (req.user._id === entry.author._id) {
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
        res.json ({ message: 'Permission denied: User is not the author.'});
      }
    });
}

// Delete Entry
exports.deleteEntry = (req, res, next) => {
  Entry.findById(req.params.entryID)
    .populate('author')
    .exec((err, entry) => {
      if (err) { return next(err); }

      if (req.user._id === entry.author._id) {
        Entry.findByIdAndDelete(req.params.entryID, function (err) {
          if (err) { return next(err); }
          // Success
          res.json({ message: 'success' });
        });
      } else {
        res.json ({ message: 'Permission denied: User is not the author.'});
      }
    });
}

// Display All Entries
exports.display_entries = (req, res, next) => {
  Entry.find()
    .populate('author')
    .populate('parent')
    .sort(['timestamp', 'descending'])
    .exec((err, entry_list) => {
      if (err) { return next(err); }
      // Success
      res.json(entry_list);
    })
    .catch(err => {
      res.json(err);
    });
}

// Create a New Comment under an Entry
exports.create_comment = async (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

  Entry.findById(req.params.id)
    .exec((err, entry) => {
      if (err) { return next(err); }

      const newComment = new Comment ({
        parent: entry,
        text: req.body.text,
        author: req.user
      });

      newComment.save(err => {
        if (err) { return next(err); }
        // Success
        res.json(newComment);
      });
    });
};