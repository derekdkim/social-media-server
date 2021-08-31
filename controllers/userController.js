const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const async = require('async');
require('dotenv').config();

const User = require('../models/user');
const Comment = require('../models/comment');
const Entry = require('../models/entry');
const Journey = require('../models/journey');

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
          user: user,
          err: err
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
}

// Hash
const hash = (password) => {
  // Synchronous version of bcrypt.hash()
  return bcrypt.hashSync(password, 10);
}

// Get User's Own Data
exports.getMyInfo = (req, res, next) => {
  User.findOne({ uuid: req.user.uuid })
    .exec((err, user) => {
      if (err) { return next(err); }

      if (user.uuid === req.user.uuid) {
        res.json({ message: 'success', user: user });
      } else {
        res.json({ message: 'ERROR: UUID mismatch.' });
      }
    });
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

        // Edit intro if it exists
        if (req.body.intro) {
          inputUserData.intro = req.body.intro;
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

        // Overwrite MongoDB document
        User.findByIdAndUpdate(req.user._id, { $set: inputUserData }, { new: true }, (err, result) => {
          if (err) { return next(err); }

          res.json({ message: 'success', user: result });
        });
        
      } else {
        res.json({ message: 'Error: User Not Found'});
      }
    });
}

// Change Password
exports.changePassword = (req, res, next) => {
  User.findById(req.user._id)
    .exec((err, user) => {
      if (err) { return next(err); }

      // Verify user's current password before proceeding
      bcrypt.compare(req.body.currentPassword, req.user.password, (err, result) => {
          if (result) {
            const inputUserData = {
              password: hash(req.body.newPassword),
              _id: req.user._id
            }


            // Update User Document in MongoDB
            User.findByIdAndUpdate(req.user._id, { $set: inputUserData }, { new: true }, (err, result) => {
              if (err) { return next(err); }

              res.json({ message: 'success', user: result });
            });
          } else {
            res.json({ message: 'ERROR: Current password is incorrect.'});
          }
        });
      
    })
}

// Delete Account
exports.deleteUserAccount = (req, res, next) => {
  User.findById(req.user._id)
    .exec((err, user) => {
      if (err) { return next(err); }

      // Verify user's current password before proceeding
      bcrypt.compare(req.body.currentPassword, user.password, (err, result) => {
        if (result) {
          async.series([
            function(callback) {
              // Remove current friends
              User.updateMany({ currentFriends: user._id }, { $pull: { currentFriends: user._id  } }, { new: true })
                .exec(callback);
            },
            function(callback) {
              // Remove pending friends
              User.updateMany({ pendingFriends: user._id }, { $pull: { pendingFriends: user._id  } }, { new: true })
                .exec(callback);
            },
            function(callback) {
              // Remove reference from users who requested user as friend
              User.updateMany({ myRequests: user._id }, { $pull: { myRequests: user._id  } }, { new: true })
                .exec(callback);
            },
            function(callback) {
              // Remove all comments posted by user
              Comment.deleteMany({ author: user._id })
                .exec(callback); 
            },
            function(callback) {
              // Remove all entries posted by user
              Entry.deleteMany({ author: user._id })
                .exec(callback); 
            },
            function(callback) {
              // Remove all comments posted by user
              Journey.deleteMany({ author: user._id })
                .exec(callback); 
            },
            function(callback) {
              // Finally, delete the user document
              User.deleteOne({ uuid: user.uuid })
                .exec(callback);    
            }
          ], (err, results) => {
            if (err) { return next(err); }

            res.json({ message: 'success' });
          });
        } else {
          res.json({ message: 'ERROR: Current password is incorrect.'});
        }
      });
    });
}

// Search for users using MongoDB Atlas Search
/* 
  NOTE: This cannot be unit tested as the test DB is not on Atlas. Only Atlas MongoDB supports elastic searches.
  Tested manually using Postman
*/
exports.searchUsers = (req, res, next) => {
  User.aggregate().search({
    index: 'default',
    text: {
      query: req.params.query,
      path: {
        'wildcard': '*'
      }
    }
  })
  .exec((err, result) => {
    if (err) { return next(err); }

    res.json({ message: 'success', result: result });
  })
}