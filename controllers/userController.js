const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.sign_up_GET = (req, res, next) => {
  res.send('GET sign up');
}

exports.sign_up_POST = (req, res, next) => {
  const newUser = new User (
    {
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthDate: req.body.birthDate
    }
  );
  // Save user info to DB
  // UserSchema's pre() handles the hashing prior to saving
  newUser.save(err => {
    // Failure
    if (err) { return next(err); }
    // Success
    res.json({
      message: 'Sign-up successful',
      user: req.user
    })    
  });
};

exports.log_in_GET = (req, res, next) => {
  res.send('GET log in');
}

exports.log_in_POST = (req, res, next) => {
  passport.authenticate('login', { session: false },
    (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          res.send(err);
        }

        const token = jwt.sign(user.toJSON(), 'TOP_SECRET');
        return res.json({ user, token });
      });
    }
  )(req, res);
}