const mongoose = require('mongoose');
import 'regenerator-runtime/runtime';
const request = require('supertest');
require('dotenv').config();

const app = require('./testApp');
const User = require('../models/user');

const userData = [
  { 
    username: 'testerUser0', 
    password: 'testest',
    firstName: 'Tester0',
    lastName: 'McTesterface',
    birthDate: new Date()
  },
  { 
    username: 'testerUser1', 
    password: 'testest',
    firstName: 'Tester1',
    lastName: 'McTesterface',
    birthDate: new Date()
  },
  { 
    username: 'testerUser2', 
    password: 'testest',
    firstName: 'Tester2',
    lastName: 'McTesterface',
    birthDate: new Date()
  },
];

const signUpReq = async (input) => {
  let user;
  await request(app)
    .post('/users/sign-up')
    .send(input)
    .set('Accept', 'application/json')
    .then(res => {
      user = res.body.user;
    });
  return user;
};

describe('Friend Request Test', () => {
  let userArray = [];
  let token, user;

  beforeAll(async () => {
    // Register 3 users
    const user0 = await signUpReq(userData[0]);
    const user1 = await signUpReq(userData[1]);
    const user2 = await signUpReq(userData[2]);

    userArray.push(user0);
    userArray.push(user1);
    userArray.push(user2);

    // Login with user0
    await request(app)
      .post('/users/log-in')
      .send({ username: 'testerUser0', password: 'testest' })
      .set('Accept', 'application/json')
      .then((res) => {
        token = res.body.token;
        user = res.body.user;
      })
      .catch((err, done) => {
        console.log(err);
        done(err);
      });
  });

  it('User can send friend request to another user', async () => {
    // Create friend request with user1
    const targetUser = userArray[1];

    await request(app)
      .post(`/users/${targetUser._id}/request`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.message).toBe('success');
        expect(res.body.user.username).toBe(targetUser.username);
        expect(res.body.user.pendingFriends[0]).toBe(user._id);
      });
  });

  it('User can accept friend request', async () => {
    const user0 = userArray[0];
    const user2 = userArray[2];

    // Log-in as user2
    let user2Token;
    await request(app)
      .post('/users/log-in')
      .send({ username: 'testerUser2', password: 'testest' })
      .set('Accept', 'application/json')
      .then((res) => {
        user2Token = res.body.token;
      }).catch(err => {
        console.log(err);
      });

    // Send friend request from user0 to user2
    await request(app)
      .post(`/users/${user2._id}/request`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.user.pendingFriends.length).toBe(1);
        expect(res.body.user.pendingFriends[0]).toBe(user0._id);
      })
      .catch((err, done) => {
        done(err);
      });

    await request(app)
      .post(`/users/${user0._id}/accept`)
      .set('Authorization', `Bearer ${user2Token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.message).toBe('success');
        expect(res.body.user.username).toBe(user2.username);
        expect(res.body.user.currentFriends[0]).toBe(user0._id);
        expect(res.body.user.pendingFriends.length).toBe(0);
      });
  });

  afterAll(async (done) => { 
    await mongoose.connection.close();
    done();
  });
});