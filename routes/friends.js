const express = require('express');
const router = express.Router();
const passport = require('passport');

const friendController = require('../controllers/friendController');

// GET: Display friend list
router.get('/all', passport.authenticate('jwt', { session: false }), friendController.displayCurrentFriends);

// GET: Display all pending friends
router.get('/pending', passport.authenticate('jwt', { session: false }), friendController.displayPendingFriends);

/* Friend Request*/
// SENDER USER: Make a friend request to target user ID
router.post('/:id/request', passport.authenticate('jwt', { session: false }), friendController.createFriendReq);

// RECIPIENT USER: Accept friend request of target user ID
router.put('/:id/accept', passport.authenticate('jwt', { session: false }), friendController.acceptFriendReq);

// RECIPIENT USER: Decline friend request of target user ID
router.put('/:id/decline', passport.authenticate('jwt', { session: false }), friendController.declineFriendReq);

// UPDATE: Remove friend from the friend list
router.put('/:id/remove', passport.authenticate('jwt', { session: false }), friendController.removeFriend);

module.exports = router;