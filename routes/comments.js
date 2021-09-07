const express = require('express');
const router = express.Router();
const passport = require('passport');

const commentController = require('../controllers/commentController');

const JWTauth = passport.authenticate('jwt', { session: false });

// POST: Create new comment
router.post('/:entryID/new', JWTauth, commentController.createComment);

// UPDATE: Edit comment
router.put('/:commentID', JWTauth, commentController.editComment);

// DELETE: Delete comment
router.delete('/:commentID', JWTauth, commentController.deleteComment);

// GET: Display all comments
router.get('/:entryID/all', commentController.displayComments);

// UPDATE: Like specified comment
router.put('/:commentID/like', JWTauth, commentController.likeComment);

// UPDATE: Like specified comment
router.put('/:commentID/unlike', JWTauth, commentController.unlikeComment);


module.exports = router;