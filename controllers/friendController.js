const async = require('async');
const User = require('../models/user');

/* Create Friend Request */
exports.createFriendReq = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

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
    res.json({ message: 'success', sender: results.sender, recipient: results.recipient });
  });
}

/* Accept Friend Request */
exports.acceptFriendReq = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

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
    res.json({ message: 'success', sender: results.sender, recipient: results.recipient });
  });
}

/* Decline Friend Request */
exports.declineFriendReq = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

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
    res.json({ message: 'success', sender: results.sender, recipient: results.recipient });
  });
}

/* Remove Existing Friend */
exports.removeFriend = (req, res, next) => {
  if (!req.user) {
    console.log('FAILED: User is not authenticated.');
    return next();
  }

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
    res.json({ message: 'removal success', sender: results.sender, recipient: results.recipient });
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