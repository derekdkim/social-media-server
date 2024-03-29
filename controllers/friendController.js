const async = require('async');
const User = require('../models/user');

/* Create Friend Request */
exports.createFriendReq = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

  async.parallel({
    sender: function(callback) {
      // Update Sender
      User.findByIdAndUpdate(req.user.id, { $push: { myRequests: req.params.id } }, { new: true })
        .populate('myRequests')
        .exec(callback);
    },
    recipient: function(callback) {
      // Update Recipient
      User.findByIdAndUpdate(req.params.id, { $push: { pendingFriends: req.user.id } }, { new: true })
        .populate('pendingFriends')
        .exec(callback);
    }
  }, async (err, results) => {
    if (err) { return next(err); }
    
    // return relevant info for testing
    res.json({ message: 'success', sender: results.sender, recipient: results.recipient });
  });
}

/* Accept Friend Request */
exports.acceptFriendReq = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

  async.parallel({
    sender: function(callback) {
      // Update Sender
      User.findByIdAndUpdate(req.params.id, { $push: { currentFriends: req.user.id }, $pull: { myRequests: req.user.id } }, { new: true })
        .populate('currentFriends')
        .exec(callback);
    },
    recipient: function(callback) {
      // Update Recipient
      User.findByIdAndUpdate(req.user.id, { $push: { currentFriends: req.params.id }, $pull: { pendingFriends: req.params.id } }, { new: true })
        .populate('currentFriends')
        .exec(callback);
    }
  }, async (err, results) => {
    if (err) { return next(err); }
    
    // return relevant info for testing
    res.json({ message: 'success', sender: results.sender, recipient: results.recipient });
  });
}

/* Decline Friend Request */
exports.declineFriendReq = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

  // Do the opposite ($pull) of the make request ($push) function
  async.parallel({
    sender: function(callback) {
      // Update Sender
      User.findByIdAndUpdate(req.params.id, { $pull: { myRequests: req.user.id } }, { new: true })
        .populate('myRequests')
        .exec(callback);
    },
    recipient: function(callback) {
      // Update Recipient
      User.findByIdAndUpdate(req.user.id, { $pull: { pendingFriends: req.params.id } }, { new: true })
        .populate('pendingFriends')
        .exec(callback);
    }
  }, async (err, results) => {
    if (err) { return next(err); }
    
    // return relevant info for testing
    res.json({ message: 'success', sender: results.sender, recipient: results.recipient });
  });
}

/* Remove Existing Friend */
exports.removeFriend = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

  // Pull each other friend their currentFriends field
  async.parallel({
    sender: function(callback) {
      // Update Sender
      User.findByIdAndUpdate(req.user.id, { $pull: { currentFriends: req.params.id } }, { new: true })
        .populate('currentFriends')
        .exec(callback);
    },
    recipient: function(callback) {
      // Update Recipient
      User.findByIdAndUpdate(req.params.id, { $pull: { currentFriends: req.user.id } }, { new: true })
        .populate('currentFriends')
        .exec(callback);
    }
  }, async (err, results) => {
    if (err) { return next(err); }
    
    // return relevant info for testing
    res.json({ message: 'success', sender: results.sender, recipient: results.recipient });
  });
}

/* Display Pending Friend Requests */
exports.displayPendingFriends = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

  User.findById(req.user._id)
    .populate('pendingFriends')
    .exec((err, user) => {
      if (err) { return next(err); }

      res.json({ message: 'success', pendingFriends: user.pendingFriends });
    });
}

/* Display Friend List */
exports.displayCurrentFriends = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }
  
  User.findById(req.user._id)
    .populate('currentFriends')
    .exec((err, user) => {
      if (err) { return next(err); }

      res.json({ message: 'success', currentFriends: user.currentFriends });
    });
}