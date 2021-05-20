const express = require('express');
const router = express.Router();

router.get('new', (req, res, next) => {
  res.send('POST new comment');
});

router.put('/:id', (req, res, next) => {
  res.send('UPDATE comment');
});

router.delete('/:id', (req, res, next) => {
  res.send('DELETE comment');
});

router.put('/:id', (req, res, next) => {
  res.send('Like comment');
});


module.exports = router;