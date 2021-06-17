const Entry = require('../models/entry');
const Comment = require('../models/comment');

// Display all comments of an entry
exports.displayComments = (req, res, next) => {
  Comment.find({ parent: req.params.entryID })
    .populate('author')
    .populate('parent')
    .sort({ timestamp: 1 })
    .exec((err, comments) => {
      if (err) { return next(err); }

      res.json(comments);
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

      if (comment.author.uuid === req.user.uuid) {
        const changedComment = {
          text: req.body.text,
          _id: req.params.commentID
        }

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

      if (comment.author.uuid === req.user.uuid) {
        Comment.findByIdAndDelete(req.params.commentID, (err, result) => {
          if (err) { return next(err); }

          res.json({ message: 'success' });
        });
      }  
    });
};