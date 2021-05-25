const mongoose = require('mongoose');
import 'regenerator-runtime/runtime';
const request = require('supertest');
require('dotenv').config();

const app = require('./testApp');
const User = require('../models/user');
const Entry = require('../models/entry');
const Comment = require('../models/comment');

describe('Create Entry Test', () => {
  let token, user;
  beforeAll(async () => {
    // Sign-up test user
    await request(app)
      .post('/users/sign-up')
      .send({
        username: process.env.AUTH_TEST_USERNAME,
        password: process.env.AUTH_TEST_PASSWORD,
        firstName: 'Tester',
        lastName: 'Tester',
        birthDate: new Date()
      })
      .set('Accept', 'application/json')

    // Log-in test user
    await request(app)
      .post('/users/log-in')
      .send({
        username: process.env.AUTH_TEST_USERNAME,
        password: process.env.AUTH_TEST_PASSWORD
      })
      .set('Accept', 'applicaton/json')
      .then((res) => {
        token = res.body.token;
        user = res.body.user;
      })
      .catch((err, done) => {
        console.log(err);
        done(err);
      });
  });

  it('Cannot create post if not logged in', async () => {
    // Attempt to create entry. Should not work as user is unauthenticated
    await request(app)
      .post('/entries/new')
      .send({
        text: 'testing'
      })
      .set('Accept', 'applicaton/json')
      .then((res) => {
        expect(res.statusCode).toBe(401);
      });
  });

  it('Create post test with JWT authorization', async () => {

    // Create entry
    await request(app)
      .post('/entries/new')
      .send({
        text: 'testing'
      })
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.text).toBe('testing');
        expect(res.body.author).toStrictEqual(user);
      });
  });

  it('Successfully creates a comment in an existing entryId', async () => {
    let entryId;
    // Create entry
    await request(app)
      .post('/entries/new')
      .send({
        text: 'Parent entryId'
      })
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        entryId = res.body._id;
      })
      .catch((err, done) => {
        console.log(err);
        done(err);
      });

    // Create comment in parent entry
    await request(app)
      .post(`/entries/${entryId}/comments/new`)
      .send({
        text: 'testing'
      })
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.text).toBe('testing');
        expect(res.body.author).toStrictEqual(user);
      })
      .catch((err, done) => {
        console.log(err);
        done(err);
      });
  });

  afterAll(async (done) => {
    await mongoose.connection.close();
    done();
  });
});