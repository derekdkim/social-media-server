// External package imports
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config();

// Internal imports
require('./auth/passport');

// Router imports
const entriesRouter = require('./routes/entries');
const usersRouter = require('./routes/users');
const friendsRouter = require('./routes/friends');

const app = express();

// MongoDB
const mongoDB = process.env.MONGODB_KEY;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// App-level Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/entries', passport.authenticate('jwt', { session: false }), entriesRouter);
app.use('/friends', passport.authenticate('jwt', { session: false }), friendsRouter);
app.use('/users', usersRouter);

module.exports = app;
