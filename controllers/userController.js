const passport = require('passport');
const jwt = require('jsonwebtoken');
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
  // Find User Model of the user receiving the friend request
  User.findById(req.params.id)
    .exec((err, targetUser) => {
      if (err) { return next(err); }

      // Append the sender user to pendingFriends array
      targetUser.pendingFriends.push(req.user.id);
      targetUser.save(err => {
        if (err) { return next(err); }
        // Success
        res.json({message: 'success', user: targetUser});
      });
    });
}

/* Accept Friend Request */
exports.acceptFriendReq = (req, res, next) => {
  // Find User Model of the sender user
  User.findById(req.params.id)
    .exec((err, targetUser) => {
      if (err) { return next(err); }

      // Remove user on pending friends array
      let newPendingArr = [...req.user.pendingFriends];
      req.user.pendingFriends = newPendingArr.filter(id => id !== `${targetUser._id}`);
    
      // Append the sender user to currentFriends array
      req.user.currentFriends.push(targetUser.id);

      // Save Changes to MongoDB
      req.user.save(err => {
        if (err) { return next(err); }
        // Success
        const resUser = req.user;
        res.json({message: 'success', user: resUser});
      });
    });
}

/* Decline Friend Request */
exports.declineFriendReq = (req, res, next) => {
  // Find User Model of the sender user
  User.findById(req.params.id)
    .exec((err, targetUser) => {
      if (err) { return next(err); }

      // Remove user on pending friends array
      let newPendingArr = [...req.user.pendingFriends];
      req.user.pendingFriends = newPendingArr.filter(id => id !== `${targetUser._id}`);
      
      // Save Changes to MongoDB
      req.user.save(err => {
        if (err) { return next(err); }
        // Success
        const resUser = req.user;
        res.json({ message: 'success', user: resUser });
      });
    });
}

/* Remove Existing Friend */
exports.removeFriend = (req, res, next) => {
  // Check if target user ID is already in friend list in case of duplicate requests
  if (req.user.currentFriends.includes(req.params.id)) {
    User.findByIdAndUpdate(req.user._id, { $pull: { currentFriends: req.params.id } }, (err, user) => {
      if (err) { return next(err); }
      // Success
      res.json({ message: 'removal success', user });
    });
  }
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