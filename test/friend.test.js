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
  { 
    username: 'testerUser3', 
    password: 'testest',
    firstName: 'Tester3',
    lastName: 'McTesterface',
    birthDate: new Date()
  }
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

const logInReq = async (username) => {
  let token;
  await request(app)
  .post('/users/log-in')
  .send({ username: username, password: 'testest' })
  .set('Accept', 'application/json')
  .then((res) => {
    token = res.body.token;
  })
  .catch((err, done) => {
    console.log(err);
    done(err);
  });
  return token;
}

/* Note: As the DB does not reset until the entire test suite is killed or completed, each test user should only make one lasting change to its current and pending friend list. 
         This is to ensure each method is performed in a new, unchanged environment. Create more test users for additional tests. */
/* 
  Test user legend: (brackets indicate data was written to the account in MongoDB at the end of the test case)
  Request test: user0 --REQUEST--> (user1)
  Accept test: user0 --REQUEST--> (user2) --ACCEPT--> user0
  Decline test: user1 --REQUEST--> user0 --DECLINE--> user1
  Remove test: user0 --REQUEST--> user3 --ACCEPT--> user0 // user3 --REMOVE--> user0
*/
describe('Friend Request Test', () => {
  let token0, token1, token2, token3, user0, user1, user2, user3;

  beforeAll(async () => {
    // Register users
    user0 = await signUpReq(userData[0]);
    user1 = await signUpReq(userData[1]);
    user2 = await signUpReq(userData[2]);
    user3 = await signUpReq(userData[3]);

    // Log-in with users and record each token
    token0 = await logInReq(userData[0].username);
    token1 = await logInReq(userData[1].username);
    token2 = await logInReq(userData[2].username);
    token3 = await logInReq(userData[3].username);
  });

  it('User can send friend request to another user', async () => {
    // Create friend request with user1
    await request(app)
      .post(`/users/${user1._id}/request`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.message).toBe('success');
        expect(res.body.user.username).toBe(user1.username);
        expect(res.body.user.pendingFriends[0]).toBe(user0._id);
      });
  });

  it('User can accept friend request', async () => {
    // Send friend request from user0 to user2
    await request(app)
      .post(`/users/${user2._id}/request`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.user.pendingFriends.length).toBe(1);
        expect(res.body.user.pendingFriends[0]).toBe(user0._id);
      })
      .catch((err, done) => {
        done(err);
      });

    // Accept friend request
    await request(app)
      .put(`/users/${user0._id}/accept`)
      .set('Authorization', `Bearer ${token2}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.message).toBe('success');
        expect(res.body.user._id).toBe(user2._id);
        expect(res.body.user.currentFriends.length).toBe(1);
        expect(res.body.user.currentFriends[0]).toBe(user0._id);
        expect(res.body.user.pendingFriends.length).toBe(0);
      });
  });

  it('User can decline friend request', async () => {
    // Send friend request from user1 to user0
    await request(app)
      .post(`/users/${user0._id}/request`)
      .set('Authorization', `Bearer ${token1}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.user.pendingFriends.length).toBe(1);
        expect(res.body.user.pendingFriends[0]).toBe(user1._id);
      })
      .catch((err, done) => {
        console.log(err);
        done(err);
      });

    // user0 declines friend request from user1
    await request(app)
      .put(`/users/${user1._id}/decline`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.message).toBe('success');
        expect(res.body.user._id).toBe(user0._id);
        expect(res.body.user.currentFriends.length).toBe(0);
        expect(res.body.user.pendingFriends.length).toBe(0);
      });
  });

  it('User can remove friend after accepting', async () => {
    // Send friend request from user0 to user3
    await request(app)
      .post(`/users/${user3._id}/request`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.user.pendingFriends.length).toBe(1);
        expect(res.body.user.pendingFriends[0]).toBe(user0._id);
      })
      .catch((err, done) => {
        done(err);
      });

    // Accept friend request
    await request(app)
      .put(`/users/${user0._id}/accept`)
      .set('Authorization', `Bearer ${token3}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.message).toBe('success');
        expect(res.body.user._id).toBe(user3._id);
        expect(res.body.user.currentFriends.length).toBe(1);
        expect(res.body.user.currentFriends[0]).toBe(user0._id);
        expect(res.body.user.pendingFriends.length).toBe(0);
      });
    
    // Remove friend
    await request(app)
      .put(`/users/${user0._id}/remove`)
      .set('Authorization', `Bearer ${token3}`)
      .then((res) => {
        console.log(user0._id === res.body.user.currentFriends[0]);
        console.log(`${user0._id} ${res.body.user.currentFriends}`);
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.message).toBe('removal success');
        expect(res.body.user._id).toBe(user3._id);
        expect(res.body.user.currentFriends.length).toBe(0);
        expect(res.body.user.pendingFriends.length).toBe(0);
      });
  });

  it('Properly displays pending friend list', async () => {
    // Send friend request from user1 to user0
    await request(app)
      .post(`/users/${user0._id}/request`)
      .set('Authorization', `Bearer ${token1}`)
    
    // Send friend request from user2 to user0
    await request(app)
      .post(`/users/${user0._id}/request`)
      .set('Authorization', `Bearer ${token2}`)

    // Get pending friend list
    await request(app)
      .get('/users/friends/pending')
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.length).toBe(2);
        expect(res.body.includes(`${user1._id}`, `${user2._id}`)).toBe(true);
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