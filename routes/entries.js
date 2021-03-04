const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const entryController = require('../controllers/entryController');

// GET index for secure route testing
router.get('/', (req, res, next) => {
  res.json({ message: 'Secure route access granted' });
});

/* Create Post */
router.post('/new', entryController.create_entry);

/* Display all posts */
// TO-DO: REWORK THIS TO DISPLAY ONLY POSTS BY USER'S FRIEND GROUP
router.get('/all', entryController.display_entries);

/* Create new comment */
router.post('/:id/comments/new', entryController.create_comment);

module.exports = router;