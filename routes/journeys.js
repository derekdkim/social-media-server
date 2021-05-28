const express = require('express');
const router = express.Router();

const journeyController = require('../controllers/journeyController');

// UNTESTED
// GET: Display all journeys
router.get('/all', journeyController.displayAllJourneys);

// UNTESTED
// GET: Display friends' journeys
router.get('/friends', journeyController.displayFriendsJourneys);

// UNTESTED
// GET: Display my journeys
router.get('/private', journeyController.displayMyJourneys);

// UNTESTED
// POST: Create new journey
router.post('/new', journeyController.createJourney);

// GET: Display journey details
router.get('/:id', journeyController.displayJourneyPage);

// UPDATE: Update specified journey
router.put('/:id', journeyController.editJourney);

// DELETE: Delete specified journey
router.delete('/:id', journeyController.deleteJourney);

// POST: Join specified journey as participant
router.post('/:id/join', (req,res, next) => {
  // Placeholder
  res.send('JOIN journey');
});

module.exports = router;