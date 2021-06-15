const Journey = require('../models/journey');
const Entry = require('../models/entry');
const Comment = require('../models/comment');
const async = require('async');
const User = require('../models/user');

// Display all journeys viewable for user
exports.displayAllJourneys = (req, res, next) => {
  async.parallel({
    public: function(callback) {
      // Fetch all public journeys in the collection
      Journey.find({ privacy: 0 })
        .sort({ timestamp: -1 })
        .exec(callback);
    },
    friendsOnly: function(callback) {
      const idList = [req.user._id, ...req.user.currentFriends];

      // Fetch friends-only journeys
      Journey.find({ author: { $in: idList }, privacy: 1 })
        .sort({ timestamp: -1 })
        .exec(callback);
    },
    myPrivate: function(callback) {
      Journey.find({ author: req.user, privacy: 2 })
        .sort({ timestamp: -1 })
        .exec(callback);
    }
  }, (err, results) => {
    if (err) { return next(err); }
    
    // TODO: Deal with chronological sorting in combined journeys array
    const journeyList = [...results.public, ...results.friendsOnly, ...results.myPrivate];
    // Send combined journey list
    res.json({ journeys: journeyList });
  });
  // TODO: Display only 10 at a time, with pages
}

// Display yours and friends' journeys
exports.displayFriendsJourneys = (req, res, next) => {
  const idList = [req.user._id, ...req.user.currentFriends];

  // Fetch journeys with authors that are in friends' list except private journeys
  Journey.find({ author: { $in: idList }, privacy: { $ne: 2 } })
    .sort({ timestamp: -1 })
    .exec((err, journeys) => {
      if (err) { return next(err); }

      res.json({ journeys: journeys });
    });
}

// Display only my journeys
exports.displayMyJourneys = (req, res, next) => {
  // Fetch journey with author matching req.user.id
  Journey.find({ author: req.user.id })
    .sort({ timestamp: -1 })
    .exec((err, journeys) => {
      if (err) { return next(err); }

      res.json(journeys);
    })
    .catch(err => {
      res.json(err);
    });
}

// Display journey page details
exports.displayJourneyPage = async (req, res, next) => {
  // Fetch journey with specified url as id
  await Journey.findById(req.params.id)
    .populate('author')
    .exec((err, journey) => {
      if (err) { return next(err); }
      
      res.json({ message: 'success', journey });
    });
}

// Create new journey
exports.createJourney = (req, res, next) => {
  User.findById(req.user._id)
    .exec((err, user) => {
      // Initialize new Journey object
      const newJourney = new Journey(
        {
          title: req.body.title,
          author: user,
          timestamp: new Date(),
          privacy: req.body.privacy
        }
      );

      // Add description if there is one
      if (req.body.desc && typeof req.body.desc === 'string') {
        newJourney.desc = req.body.desc;
      }

      // Add due date if there is one
      if (req.body.dueDate) {
        // JSON does not have Date datatype
        const workingDueDate = new Date(req.body.dueDate);
        // Validate if input is a proper date
        if (!isNaN(workingDueDate.getTime())) {
          newJourney.dueDate = req.body.dueDate;
        }
      }

      // Add tags if there are any
      if (req.body.tags && req.body.tags.length > 0) {
        newJourney.tags = [...req.body.tags];
      }

      // TODO: Add verification process prior to saving journeys
      newJourney.save((err) => {
        if (err) { return next(err); }

        res.json({ message: 'success', journey: newJourney });
        // res.redirect(newJourney.url);
      });
    });
}

// Update journey
exports.editJourney = (req, res, next) => {
  const changedJourney = {
    title: req.body.title,
    privacy: req.body.privacy,
    _id: req.params.id
  };

  // Add description if there is one
  if (req.body.desc && typeof req.body.desc === 'string') {
    changedJourney.desc = req.body.desc;
  }

  // Add due date if there is one
  if (req.body.dueDate) {
    // JSON does not have Date datatype
    const workingDueDate = new Date(req.body.dueDate);
    // Validate if input is a proper date
    if (!isNaN(workingDueDate.getTime())) {
      changedJourney.dueDate = req.body.dueDate;
    }
  }

  // Add tags if there are any
  if (req.body.tags && req.body.tags.length > 0) {
    changedJourney.tags = [...req.body.tags];
  }

  Journey.findByIdAndUpdate(req.params.id, changedJourney, { new: true }, function(err, result) {
    if (err) { return next(err); }

    // success
    res.json({ message: 'edit success', journey: result });
  });
};

// Remove journey
// TODO: Need to remove all entries and comments referencing this journey when it gets deleted
exports.deleteJourney = async (req, res, next) => {
  async.parallel({
    user: function (callback) {
      User.findById(req.user._id).exec(callback);
    },
    journey: function (callback) {
      Journey.findById(req.params.id)
        .populate('author')
        .exec(callback);
    } 
  }, function (err, results) {

    // Verify that the current user is the author
    if (results.user.uuid === results.journey.author.uuid) {
      let entryArr;
      let commentCount = 0;
      let entryCount = 0;

      async.series([
        function(callback) {
          // Find child entries of the journey
          Entry.find({ parent: req.params.id })
            .exec((err, entries) => {
              if (err) { return next(err); }

              // Make an array with only entry IDs
              entryArr = entries;
              callback(null, 'one');
            });
        },
        function(callback) {
          // Delete all child comments         
          Comment.deleteMany({ 'parent': { '$in': entryArr } }, (err, result) => {
            if (err) { return next(err); }

            if (result.deletedCount > 0) {
              commentCount += result.deletedCount;
            }
            callback(null, 'two');
          });
        },
        function(callback) {
          // Delete child entries
          Entry.deleteMany({ parent: req.params.id }, (err, result) => {
            if (err) { return next (err); }

            if (result.deletedCount > 0) {
              entryCount += result.deletedCount;
            }
            callback(null, 'three');
          });
        },
        function(callback) {
          // Delete the journey itself
          Journey.findByIdAndDelete(req.params.id).exec(callback);
        }
      ], 
      // Send response JSON
      function (err, results) {
        if (err) { return next(err); }

        res.json({ message: 'delete success', entryCount: entryCount, commentCount: commentCount });
      });
    }
  });
}

// Join journey