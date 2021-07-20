const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/userController');

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

// UPDATE: Edit user's own info
router.put('/edit', passport.authenticate('jwt', { session: false }), userController.editUserInfo);

module.exports = router;
