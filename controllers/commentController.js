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

      res.json({ message: 'success', comments: comments });
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
        res.json({ message: 'success', comment: newComment });
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

// Like comment
exports.likeComment = async (req, res, next) => {
  // Fetch comment in question
  Comment.findById(req.params.commentID)
    .exec((err, comment) => {
      if (err) { return next(err); }

      // Only proceed if user has not yet liked this comment
      if (comment.likedBy.includes(req.user.uuid)) {
        res.json({ message: 'This user has already liked this comment.'});
      } else {
        // Push requesting user's uuid to the likedBy array to prevent duplicate likes from the same user
        Comment.findByIdAndUpdate(req.params.commentID, { $push: { likedBy: req.user.uuid} }, { new: true }, (err, result) => {
          if (err) { return next(err); }

          res.json({ message: 'success', likedBy: result.likedBy, likedCount: result.likedBy.length });
        });
      }
    });
}

// Unlike comment
exports.unlikeComment = async (req, res, next) => {
  // Fetch comment in question
  Comment.findById(req.params.commentID)
    .exec((err, comment) => {
      if (err) { return next(err); }

      // Only proceed if user has not yet liked this comment
      if (comment.likedBy.includes(req.user.uuid)) {
        // Pull requesting user's uuid from the likedBy array
        Comment.findByIdAndUpdate(req.params.commentID, { $pull: { likedBy: req.user.uuid} }, { new: true }, (err, result) => {
          if (err) { return next(err); }

          res.json({ message: 'success', likedBy: result.likedBy, likedCount: result.likedBy.length });
        });
      } else {
        res.json({ message: 'This user has not liked this comment.'});
      }
    });
}