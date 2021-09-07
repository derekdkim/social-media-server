const express = require('express');
const router = express.Router();
const passport = require('passport');

const journeyController = require('../controllers/journeyController');

const JWTauth = passport.authenticate('jwt', { session: false });

// GET: Display all journeys
router.get('/all', JWTauth, journeyController.displayAllJourneys);

// GET: Display friends' journeys
router.get('/friends', JWTauth, journeyController.displayFriendsJourneys);

// GET: Display my journeys
router.get('/private', JWTauth, journeyController.displayMyJourneys);

// GET: Display participating journeys
router.get('/participating', JWTauth, journeyController.displayParticipatingJourneys);

// GET: Display other user's journeys
router.get('/user-journeys/:id', JWTauth, journeyController.displayUserJourneys);

// POST: Create new journey
router.post('/new', JWTauth, journeyController.createJourney);

// GET: Display journey details
router.get('/:id', journeyController.displayJourneyPage);

// UPDATE: Update specified journey
router.put('/:id', JWTauth, journeyController.editJourney);

// UPDATE: Remove due date from journey
router.put('/:id/remove-due-date', JWTauth, journeyController.removeDueDate);

// DELETE: Delete specified journey
router.delete('/:id', JWTauth, journeyController.deleteJourney);

// UPDATE: Like specified journey
router.put('/like/:id', JWTauth, journeyController.likeJourney);

// UPDATE: Unlike specified journey
router.put('/unlike/:id', JWTauth, journeyController.unlikeJourney);

// UPDATE: Join specified journey as participant
router.put('/join/:id', JWTauth, journeyController.joinJourney);

// UPDATE: Leave specified journey
router.put('/leave/:id', JWTauth, journeyController.leaveJourney);

module.exports = router;