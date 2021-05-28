const mongoose = require('mongoose');
import 'regenerator-runtime/runtime';
const request = require('supertest');
require('dotenv').config();

const app = require('./testApp');
const User = require('../models/user');