const Journey = require('../models/journey');
const async = require('async');
const user = require('../models/user');

// Display all journeys viewable for user
exports.displayAllJourneys = (req, res, next) => {
  async.parallel({
    public: function(callback) {
      // Fetch all public journeys in the collection
      Journey.find({ privacy: 0 })
        .sort(['timestamp', 'descending'])
        .populate('entries')
        .exec(callback);
    },
    friendsOnly: function(callback) {
      // Fetch friends-only journeys
      Journey.find({ author: { $in: [req.user._id, ...req.user.currentFriends] }, privacy: 1 })
        .sort(['timestamp', 'descending'])
        .populate('entries')
        .exec(callback);
    }
  }, (err, results) => {
    if (err) { return next(err); }
    
    // TODO: Deal with chronological sorting in combined journeys array
    const journeyList = [...results.public, ...results.friendsOnly];
    // Send combined journey list
    res.json (journeyList);
  });
  // TODO: Display only 10 at a time, with pages
}

// Display yours and friends' journeys
exports.displayFriendsJourneys = (req, res, next) => {
  const friendList = req.user.currentFriends;

  // Fetch journeys with authors that are in friends' list except private journeys
  Journey.find({ author: { $in: [req.user._id, ...friendList] }, privacy: { $ne: 2 } })
    .sort(['timestamp', 'descending'])
    .populate('entries')
    .exec((err, journeys) => {
      if (err) { return next(err); }

      res.json(journeys);
    })
    .catch(err => {
      res.json(err);
    });
}

// Display only my journeys
exports.displayMyJourneys = (req, res, next) => {
  // Fetch journey with author matching req.user.id
  Journey.find({ author: req.user.id })
    .sort(['timestamp', 'descending'])
    .populate('entries')
    .exec((err, journeys) => {
      if (err) { return next(err); }

      res.json(journeys);
    })
    .catch(err => {
      res.json(err);
    });
}

// Display journey page details
exports.displayJourneyPage = (req, res, next) => {
  // Fetch journey with specified url as id
  Journey.findById(req.params.id)
    .populate('entries')
    .exec((err, journey) => {
      if (err) { return next(err); }
      
      res.json(journey);
    })
    .catch(err => {
      res.json(err);
    });
}

// Create new journey
exports.createJourney = (req, res, next) => {
  user.findById(req.user.id)
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
      if (req.body.dueDate && req.body.dueDate instanceof Date) {
        newJourney.dueDate = req.body.dueDate;
      }

      // Add tags if there are any
      if (req.body.tags && req.body.tags.length >== 1) {
        newJourney.tags = [...req.body.tags];
      }

      // TODO: Add verification process prior to saving journeys
      newJourney.save((err) => {
        if (err) { return next(err); }

        res.redirect(newJourney.url);
      });
    });
}

// Update journey
exports.editJourney = (req, res, next) => {
  // Initialize new Journey object
  const changedJourney = new Journey(
    {
      title: req.body.title,
      author: req.body.author,
      desc: req.body.desc,
      timestamp: req.body.timestamp,
      privacy: req.body.privacy,
      likedBy: req.body.likedBy,
      participants: req.body.participants,
      entries: req.body.entries,
      tags: req.body.tags,
      _id:req.params.id
    }
  );

  // Add due date if there is one
  if (req.body.dueDate && req.body.dueDate instanceof Date) {
    changedJourney.dueDate = req.body.dueDate;
  }

  Journey.findByIdAndUpdate(req.params.id, changedJourney, function(err, resultJourney) {
    if (err) { return next(err); }
    // Success - redirect to changed journey page
    res.redirect(resultJourney.url);
  });
}

// Remove journey
// TODO: Need to remove all entries and comments referencing this journey when it gets deleted
exports.deleteJourney = (req, res, next) => {
  Journey.findByIdAndDelete(req.params.id, function(err) => {
    if (err) { return next(err); }

    // Redirecting to index as placeholder
    // TODO: Figure out a solution for the best place to redirect to after deleting.
    res.redirect('/');
  });
}

// Join journey