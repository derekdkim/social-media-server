const express = require('express');
const router = express.Router();
const passport = require('passport');

const journeyController = require('../controllers/journeyController');

const JWTauth = passport.authenticate('jwt', { session: false });

// UNTESTED
// GET: Display all journeys
router.get('/all', passport.authenticate('jwt', { session: false }), journeyController.displayAllJourneys);

// UNTESTED
// GET: Display friends' journeys
router.get('/friends', passport.authenticate('jwt', { session: false }), journeyController.displayFriendsJourneys);

// UNTESTED
// GET: Display my journeys
router.get('/private', passport.authenticate('jwt', { session: false }), journeyController.displayMyJourneys);

// POST: Create new journey
router.post('/new', passport.authenticate('jwt', { session: false }), journeyController.createJourney);

// GET: Display journey details
router.get('/:id', journeyController.displayJourneyPage);

// UPDATE: Update specified journey
router.put('/:id', passport.authenticate('jwt', { session: false }), journeyController.editJourney);

// DELETE: Delete specified journey
router.delete('/:id', passport.authenticate('jwt', { session: false }), journeyController.deleteJourney);

// UPDATE: Like specified journey
router.put('/like/:id', passport.authenticate('jwt', { session: false }), journeyController.likeJourney);

// UPDATE: Unlike specified journey
router.put('/unlike/:id', passport.authenticate('jwt', { session: false }), journeyController.unlikeJourney);

// POST: Join specified journey as participant
router.post('/:id/join', (req,res, next) => {
  // Placeholder
  res.send('JOIN journey');
});

module.exports = router;