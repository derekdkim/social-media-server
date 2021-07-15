const express = require('express');
const router = express.Router();
const passport = require('passport');

const commentController = require('../controllers/commentController');

// POST: Create new comment
router.post('/:entryID/new', passport.authenticate('jwt', { session: false }), commentController.createComment);

// UPDATE: Edit comment
router.put('/:commentID', passport.authenticate('jwt', { session: false }), commentController.editComment);

// DELETE: Delete comment
router.delete('/:commentID', passport.authenticate('jwt', { session: false }), commentController.deleteComment);

// GET: Display all comments
router.get('/:entryID/all', commentController.displayComments);

// UPDATE: Like specified comment
router.put('/:commentID/like', passport.authenticate('jwt', { session: false }), commentController.likeComment);

// UPDATE: Like specified comment
router.put('/:commentID/unlike', passport.authenticate('jwt', { session: false }), commentController.unlikeComment);


module.exports = router;