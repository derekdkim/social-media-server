const express = require('express');
const router = express.Router();
const passport = require('passport');

const friendController = require('../controllers/friendController');

// GET: Display friend list
router.get('/all', friendController.displayCurrentFriends);

// GET: Display all pending friends
router.get('/pending', friendController.displayPendingFriends);

/* Friend Request*/
// REQUESTER USER: Make a friend request to target user ID
// NOTE: Omitting passport.authenticate() for request results in 404 error for unknown reasons 
router.post('/:id/request', passport.authenticate('jwt', { session: false }), friendController.createFriendReq);

// RECIPIENT USER: Accept friend request of target user ID
router.put('/:id/accept', friendController.acceptFriendReq);

// RECIPIENT USER: Decline friend request of target user ID
router.put('/:id/decline', friendController.declineFriendReq);

// UPDATE: Remove friend from the friend list
router.put('/:id/remove', friendController.removeFriend);

module.exports = router;