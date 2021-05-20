const express = require('express');
const router = express.Router();

// GET: Display all journeys
router.get('/all', (req,res, next) => {
  // Placeholder
  res.send('GET all');
});

// GET: Display friends' journeys
router.get('/friends', (req,res, next) => {
  // Placeholder
  res.send('GET friends journeys');
});

// GET: Display my journeys
router.get('/private', (req,res, next) => {
  // Placeholder
  res.send('GET my journeys');
});

// GET: Display journey details
router.get('/:id', (req,res, next) => {
  // Placeholder
  res.send('GET specific journey');
});

// UPDATE: Update specified journey
router.put('/:id', (req,res, next) => {
  // Placeholder
  res.send('UPDATE journey');
});

// DELETE: Delete specified journey
router.delete('/:id', (req,res, next) => {
  // Placeholder
  res.send('DELETE journey');
});

// POST: Join specified journey as participant
router.post('/:id/join', (req,res, next) => {
  // Placeholder
  res.send('JOIN journey');
});

module.exports = router;