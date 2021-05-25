const passport = require('passport');
const jwt = require('jsonwebtoken');
const async = require('async');
require('dotenv').config();

const User = require('../models/user');

/* New User Registration */
exports.signUp = (req, res, next) => {
  const newUser = new User (
    {
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthDate: req.body.birthDate
    }
  );
  // Save user info to DB
  // UserSchema's pre() handles the hashing prior to saving
  newUser.save(err => {
    // Failure
    if (err) { return next(err); }
    // Success
    res.json({
      message: 'Sign-up successful',
      user: newUser
    })    
  });
};

/* User Authentication and JWT generation */
exports.logIn = (req, res, next) => {
  passport.authenticate('login', { session: false },
    (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          res.send(err);
        }

        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, { expiresIn: 86400 * 30 });
        return res.json({ user, token });
      });
    }
  )(req, res);
}

/* Log out */
exports.logOut = (req, res, next) => {
  req.logout();
  res.redirect('/');
}