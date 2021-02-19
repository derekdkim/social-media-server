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
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

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

app.use('/', indexRouter);
app.use('/users', passport.authenticate('jwt', { session: false }), usersRouter);

module.exports = app;
