const express = require('express');
const router = express.Router();
const passport = require('passport');

const entryController = require('../controllers/entryController');

/* NOTE: Entry route uses its parent journey ID as its root. 
   It follows this convention: /entries/:journeyID/:entryID/
*/

// GET index for secure route testing
router.get('/', (req, res, next) => {
  res.json({ message: 'Secure route access granted' });
});

// GET: Display all entries
router.get('/all', entryController.displayEntries);

// POST: Create new entry
router.post('/:journeyID/new', passport.authenticate('jwt', { session: false }), entryController.createEntry);

// UPDATE: Edit entry
router.put('/:journeyID/:entryID', entryController.editEntry);

// DELETE: Delete entry
router.delete('/:journeyID/:entryID', entryController.deleteEntry);


module.exports = router;