const express = require('express');
const router = express.Router();

// GET: Display friend list
router.get('/all', (req, res, next) => {
  res.send('GET friend list');
});

// GET: Display all pending friends
router.get('/pending', (req, res, next) => {
  res.send('GET pending friends');
});

// UPDATE: Send friend request to target id
router.post('/:id/request', (req, res, next) => {
  res.send('POST friend request');
});

// UPDATE: Accept friend request
router.post('/:id/accept', (req, res, next) => {
  res.send('ACCEPT friend request');
});

// UPDATE: Accept friend request
router.put('/:id/decline', (req, res, next) => {
  res.send('DECLINE friend request');
});

// UPDATE: Remove friend from the friend list
router.put('/:id/remove', (req, res, next) => {
  res.send('REMOVE friend');
});

module.exports = router;