const express = require('express');
const router = express.Router();
const passport = require('passport');

const friendController = require('../controllers/friendController');

const JWTauth = passport.authenticate('jwt', { session: false });

// GET: Display friend list
router.get('/all', JWTauth, friendController.displayCurrentFriends);

// GET: Display all pending friends
router.get('/pending', JWTauth, friendController.displayPendingFriends);

/* Friend Request*/
// SENDER USER: Make a friend request to target user ID
router.post('/:id/request', JWTauth, friendController.createFriendReq);

// RECIPIENT USER: Accept friend request of target user ID
router.put('/:id/accept', JWTauth, friendController.acceptFriendReq);

// RECIPIENT USER: Decline friend request of target user ID
router.put('/:id/decline', JWTauth, friendController.declineFriendReq);

// UPDATE: Remove friend from the friend list
router.put('/:id/remove', JWTauth, friendController.removeFriend);

module.exports = router;