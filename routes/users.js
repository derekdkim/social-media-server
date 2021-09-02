const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/userController');

const JWTauth = passport.authenticate('jwt', { session: false });

// GET: Fetch users index
router.get('/',  passport.authenticate('jwt', { session: false }), function(req, res, next) {
  res.send('Secure route index');
});

// POST:  User sign-up
router.post('/sign-up', userController.signUp);

// POST: User log-in
router.post('/log-in', userController.logIn);

// GET: User log-out
router.get('/log-out', userController.logOut)

// GET: Get user's own info
router.get('/get-myself', passport.authenticate('jwt', { session: false }), userController.getMyInfo);

// GET: User Info
router.get('/:id', userController.getUserInfo);

// UPDATE: Edit user's own info
router.put('/edit', passport.authenticate('jwt', { session: false }), userController.editUserInfo);

// UPDATE: Change user's password
router.put('/edit-pw', passport.authenticate('jwt', { session: false }), userController.changePassword);

// DELETE: Delete user account
router.delete('/delete-account', passport.authenticate('jwt', { session: false }), userController.deleteUserAccount);

// GET: Search for user
router.get('/search/:query', userController.searchUsers);

module.exports = router;
