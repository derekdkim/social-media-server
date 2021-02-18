var express = require('express');
var router = express.Router();

const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('GET index');
});

/* User sign-up */
router.get('/sign-up', userController.sign_up_GET);

router.post('/sign-up', userController.sign_up_POST);

/* User log-in */
router.get('/log-in', userController.log_in_GET);

router.post('/log-in', userController.log_in_POST);

module.exports = router;
