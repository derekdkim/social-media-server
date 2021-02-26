const mongoose = require('mongoose');
import 'regenerator-runtime/runtime';
const request = require('supertest');
require('dotenv').config();

const app = require('./testApp');
const User = require('../models/user');
const Entry = require('../models/entry');
const userData = { 
  username: 'tester123', 
  password: 'hunter2',
  firstName: 'Tester',
  lastName: 'McTesterface',
  birthDate: new Date()
}

describe('Create Entry Test', () => {
  it('Cannot create post if not logged in', async () => {
    // Attempt to create entry. Should not work as user is unauthenticated
    request(app)
      .post('/entries/new')
      .send({
        text: 'testing'
      })
      .set('Accept', 'applicaton/json')
      .then((res) => {
        expect(res.statusCode).toBe(401);
      });
  });

  it('Create post test with supertest', async () => {
    // Login
    request(app)
      .post('/users/log-in')
      .send({
        username: process.env.AUTH_TEST_USERNAME,
        password: process.env.AUTH_TEST_PASSWORD
      })
      .set('Accept', 'applicaton/json')

    // Create entry
    request(app)
      .post('/entries/new')
      .send({
        text: 'testing'
      })
      .set('Accept', 'applicaton/json')
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.text).toBe('testing');
        expect(res.body.author).toBe(req.user);
      });
  });

  it('Successfully creates a comment in an existing entryId', async () => {
    let entryId;
    // Create entry
    request(app)
      .post('/entries/new')
      .send({
        text: 'Parent entryId'
      })
      .set('Accept', 'application/json')
      .then((res) => {
        entryId = res.body._id;
      });

    // Create comment in parent entry
    request(app)
      .post(`/entries/${entryId}/comments/new`)
      .send({
        text: 'testing'
      })
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.text).toBe('testing');
      });
  });

  afterAll(() => { 
    mongoose.connection.close();
  })
});