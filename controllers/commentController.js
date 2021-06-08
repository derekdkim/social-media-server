const Entry = require('../models/entry');
const Comment = require('../models/comment');

// Display all comments of an entry
exports.displayComments = (req, res, next) => {
  Comment.find({ parent: req.params.entryID })
    .populate('author')
    .populate('parent')
    .sort('timestamp', 'ascending')
    .exec((err, comments) => {
      if (err) { return next(err); }

      res.json(comments);
    })
    .catch((err) => {
      res.json(err);
    });
}

// Create a New Comment under an Entry
exports.createComment = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

  Entry.findById(req.params.entryID)
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
        res.json({ comment: newComment });
      });
    });
};

// Edit comment
exports.editComment = (req, res, next) => {
  Comment.findById(req.params.commentID)
    .populate('author')
    .exec((err, comment) => {
      if (err) { return next(err); }

      const changedComment = {
        text: req.body.text,
        _id: req.params.commentID
      }

      if (comment.author._id === req.user._id) {
        Comment.findByIdAndUpdate(req.params.commentID, changedComment, { new: true }, (err, result) => {
          if (err) { return next(err); }

          res.json({ comment: result });
        });
      }  
    });
};

// Delete comment
exports.deleteComment = (req, res, next) => {
  Comment.findById(req.params.commentID)
    .populate('author')
    .exec((err, comment) => {
      if (err) { return next(err); }

      if (comment.author._id === req.user._id) {
        Comment.findByIdAndDelete(req.params.commentID, (err, result) => {
          if (err) { return next(err); }

          res.json({ message: 'success' });
        });
      }  
    });
};