const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/userController');

const JWTauth = passport.authenticate('jwt', { session: false });

// POST:  User sign-up
router.post('/sign-up', userController.signUp);

// POST: User log-in
router.post('/log-in', userController.logIn);

// GET: User log-out
router.get('/log-out', userController.logOut)

// GET: Get user's own info
router.get('/get-myself', JWTauth, userController.getMyInfo);

// GET: User Info
router.get('/:id', userController.getUserInfo);

// UPDATE: Edit user's own info
router.put('/edit', JWTauth, userController.editUserInfo);

// UPDATE: Change user's password
router.put('/edit-pw', JWTauth, userController.changePassword);

// DELETE: Delete user account
router.delete('/delete-account', JWTauth, userController.deleteUserAccount);

// GET: Search for user
router.get('/search/:query', userController.searchUsers);

module.exports = router;
