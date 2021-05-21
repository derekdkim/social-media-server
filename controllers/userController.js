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
}

/* Create Friend Request */
exports.createFriendReq = (req, res, next) => {
  // Find both sender and recipient user models from MongoDB
  async.parallel({
    sender: function(callback) {
      User.findById(req.user.id).exec(callback);
    },
    recipient: function(callback) {
      User.findById(req.params.id).exec(callback);
    }
  }, async (err, results) => {
    if (err) { return next(err); }

    // Add each user's id to their documents so intermediary stages can be displayed on the client
    results.sender.myRequests.push(results.recipient.id);
    results.recipient.pendingFriends.push(results.sender.id);

    // Save changes to MongoDB
    results.sender.save();
    results.recipient.save();
    
    // return relevant info for testing
    res.json({message: 'success', sender: results.sender, recipient: results.recipient});
  });
}

/* Accept Friend Request */
exports.acceptFriendReq = (req, res, next) => {
  // Occurs after the recipient presses the Accept button
  // Find both sender and recipient user models from MongoDB
  async.parallel({
    sender: function(callback) {
      User.findById(req.params.id).exec(callback);
    },
    recipient: function(callback) {
      User.findById(req.user.id).exec(callback);
    }
  }, async (err, results) => {
    if (err) { return next(err); }

    // Add each user's id to their friends list
    results.sender.currentFriends.push(results.recipient.id);
    results.recipient.currentFriends.push(results.sender.id);

    // Remove the sender's id from recipient's pending list
    results.recipient.pendingFriends.pull(results.sender.id);

    // Remove the recipient's id from sender's requests list
    results.sender.myRequests.pull(results.recipient.id);

    // Save changes to MongoDB
    results.sender.save();
    results.recipient.save();
    
    // return relevant info for testing
    res.json({message: 'success', sender: results.sender, recipient: results.recipient});
  });
}

/* Decline Friend Request */
exports.declineFriendReq = (req, res, next) => {
  // Find both sender and recipient user models from MongoDB
  async.parallel({
    sender: function(callback) {
      User.findById(req.params.id).exec(callback);
    },
    recipient: function(callback) {
      User.findById(req.user.id).exec(callback);
    }
  }, async (err, results) => {
    if (err) { return next(err); }

    // Same as acceptFriendReq except omitting adding to currentFriends
    // Remove the sender's id from recipient's pending list
    results.recipient.pendingFriends.pull(results.sender.id);

    // Remove the recipient's id from sender's requests list
    results.sender.myRequests.pull(results.recipient.id);

    // Save changes to MongoDB
    results.sender.save();
    results.recipient.save();
    
    // return relevant info for testing
    res.json({message: 'success', sender: results.sender, recipient: results.recipient});
  });
}

/* Remove Existing Friend */
exports.removeFriend = (req, res, next) => {
  // Find both sender and recipient user models from MongoDB
  async.parallel({
    sender: function(callback) {
      User.findById(req.user.id).exec(callback);
    },
    recipient: function(callback) {
      User.findById(req.params.id).exec(callback);
    }
  }, async (err, results) => {
    if (err) { return next(err); }

    // Remove each user's id from their respective friends list
    results.sender.currentFriends.pull(results.recipient.id);
    results.recipient.currentFriends.pull(results.sender.id);

    // Save changes to MongoDB
    results.sender.save();
    results.recipient.save();
    
    // return relevant info for testing
    res.json({message: 'removal success', sender: results.sender, recipient: results.recipient});
  });
}

/* Display Pending Friend Requests */
exports.displayPendingFriends = (req, res, next) => {
  User.findById(req.user._id)
    .exec((err, user) => {
      if (err) { return next(err); }

      res.json(user.pendingFriends);
    });
}

/* Display Friend List */
exports.displayCurrentFriends = (req, res, next) => {
  User.findById(req.user._id)
    .exec((err, user) => {
      if (err) { return next(err); }

      res.json(user.currentFriends);
    });
}