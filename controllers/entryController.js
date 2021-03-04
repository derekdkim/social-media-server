const Entry = require('../models/entry');
const Comment = require('../models/comment');

/* Create New Entry */
exports.create_entry = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

  const newEntry = new Entry ({
    text: req.body.text,
    author: req.user,
    timestamp: new Date()
  });

  newEntry.save(err => {
    if (err) { return next(err); }
    // Success
    res.json(newEntry);
  });
}

/* Display All Entries */
exports.display_entries = (req, res, next) => {
  Entry.find()
    .populate('author')
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

/* Create a New Comment under an Entry */
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