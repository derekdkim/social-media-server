// External package imports
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config();

// Internal imports
require('./auth/passport');

// Router imports
const entriesRouter = require('./routes/entries');
const usersRouter = require('./routes/users');
const friendsRouter = require('./routes/friends');
const journeysRouter = require('./routes/journeys');
const commentsRouter = require('./routes/comments');

const app = express();

// MongoDB
const mongoDB = process.env.MONGODB_KEY;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// App-level Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  'origin': '*',
  'methods': 'GET, HEAD, PUT, PATCH, POST, DELETE'
}));

// Routers
app.use('/entries', passport.authenticate('jwt', { session: false }), entriesRouter);
app.use('/friends', passport.authenticate('jwt', { session: false }), friendsRouter);
app.use('/journeys', passport.authenticate('jwt', { session: false }), journeysRouter);
app.use('/comments', passport.authenticate('jwt', { session: false }), commentsRouter);
app.use('/users', usersRouter);

// App test
app.get('/', function (req, res) {
  res.send('Welcome to the social media API. This app is up and running.');
});

module.exports = app;
