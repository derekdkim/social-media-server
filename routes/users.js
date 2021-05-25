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

/* User log-out */
router.get('/log-out', userController.logOut)

module.exports = router;
