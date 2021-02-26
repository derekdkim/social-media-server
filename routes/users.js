const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Secure route index');
});

/* User sign-up */
router.post('/sign-up', userController.signUp);

/* User log-in */
router.post('/log-in', userController.logIn);

router.get('/log-out', userController.logOut)


module.exports = router;
