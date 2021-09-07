const express = require('express');
const router = express.Router();
const passport = require('passport');

const entryController = require('../controllers/entryController');

const JWTauth = passport.authenticate('jwt', { session: false });

/* NOTE: Entry route uses its parent journey ID as its root. 
   It follows this convention: /entries/:journeyID/:entryID/
*/

// GET index for auth secure route testing
router.get('/', (req, res, next) => {
  res.json({ message: 'Secure route access granted' });
});

// GET: Display all entries
router.get('/:journeyID/all', entryController.displayEntries);

// POST: Create new entry
router.post('/:journeyID/new', JWTauth, entryController.createEntry);

// UPDATE: Edit entry
router.put('/:journeyID/:entryID', JWTauth, entryController.editEntry);

// DELETE: Delete entry
router.delete('/:journeyID/:entryID', JWTauth, entryController.deleteEntry);

// UPDATE: Like specified entry
router.put('/:journeyID/:entryID/like', JWTauth, entryController.likeEntry);

// UPDATE: Unlike specified entry
router.put('/:journeyID/:entryID/unlike', JWTauth, entryController.unlikeEntry);

module.exports = router;