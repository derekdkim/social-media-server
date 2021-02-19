const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
require('dotenv').config();

const User = require('../models/user');

passport.use('login', new LocalStrategy(
  (username, password, done) => {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done (err); }
      if (!user) { return done(null, false, { message: 'Incorrect username' }); }

      // Compare hashed password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // Successful login
          return done(null, user, { message: 'Logged in successfully!' });
        } else {
          // Passwords do not match
          return done(null, false, {message: 'Incorrect Password' });
        }
      });
    });
  }
));

passport.use(new JWTstrategy(
  {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
  },
  async (token, done) => {
    try {
      const user = await User.findById(token._id);

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      return done(null, user, { message: 'Token recognized!' });
    } catch (error) {
      return done(error, false);
    }
    
  }
));