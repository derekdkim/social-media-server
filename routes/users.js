const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/userController');

/* GET users index */
router.get('/',  passport.authenticate('jwt', { session: false }), function(req, res, next) {
  res.send('Secure route index');
});

/* User sign-up */
router.post('/sign-up', userController.signUp);

/* User log-in */
router.post('/log-in', userController.logIn);

router.get('/log-out', userController.logOut)

/* Friend Request*/
// REQUESTER USER: Make a friend request to target user ID
router.post('/:id/request', passport.authenticate('jwt', { session: false }), userController.createFriendReq);

// RECIPIENT USER: Accept friend request of target user ID
router.put('/:id/accept', passport.authenticate('jwt', { session: false }), userController.acceptFriendReq);

// RECIPIENT USER: Decline friend request of target user ID
router.put('/:id/decline', passport.authenticate('jwt', { session: false }), userController.declineFriendReq);

// Remove friend
router.put('/:id/remove', passport.authenticate('jwt', { session: false }), userController.removeFriend);

/* Display friend list */
router.get('/friends/', passport.authenticate('jwt', { session: false }), userController.displayCurrentFriends);

/* Display all friend requests */
router.get('/friends/pending', passport.authenticate('jwt', { session: false }), userController.displayPendingFriends);

module.exports = router;
