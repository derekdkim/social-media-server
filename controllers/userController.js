const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const async = require('async');
require('dotenv').config();

const User = require('../models/user');

// New User Registration
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

// User Authentication and JWT generation
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

// Log Out
exports.logOut = (req, res, next) => {
  req.logout();
  res.redirect('/');
}

// Hash
const hash = (password) => {
  // Synchronous version of bcrypt.hash()
  return bcrypt.hashSync(password, 10);
}

// Edit User Data
exports.editUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .exec((err, user) => {
      if (err) { return next(err); }

      if (user) {
        // Organize input data
        const inputUserData = {
          _id: req.user._id
        }

        // Edit first name if it exists
        if (req.body.firstName) {
          inputUserData.firstName = req.body.firstName;
        }

        // Edit last name if it exists
        if (req.body.lastName) {
          inputUserData.lastName = req.body.lastName;
        }

        // Edit birth date if it exists
        if (req.body.birthDate) {
          inputUserData.birthDate = req.body.birthDate;
        }

        // Edit password
        if (req.body.password) {
          inputUserData.password = hash(req.body.password);
        }

        // Overwrite MongoDB document
        User.findByIdAndUpdate(req.user._id, { $set: inputUserData }, { new: true }, (err, result) => {
          res.json({ message: 'success', user: result });
        });
        
      } else {
        res.json({ message: 'Error: User Not Found'});
      }
    });
}