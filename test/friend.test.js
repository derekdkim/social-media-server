const mongoose = require('mongoose');
import 'regenerator-runtime/runtime';
const request = require('supertest');
require('dotenv').config();

const app = require('./testApp');
const User = require('../models/user');

const userData = [
  { 
    username: 'testerFriend0', 
    password: 'testest',
    firstName: 'Tester0',
    lastName: 'McTesterface',
    birthDate: new Date()
  },
  { 
    username: 'testerFriend1', 
    password: 'testest',
    firstName: 'Tester1',
    lastName: 'McTesterface',
    birthDate: new Date()
  },
  { 
    username: 'testerFriend2', 
    password: 'testest',
    firstName: 'Tester2',
    lastName: 'McTesterface',
    birthDate: new Date()
  },
  { 
    username: 'testerFriend3', 
    password: 'testest',
    firstName: 'Tester3',
    lastName: 'McTesterface',
    birthDate: new Date()
  },
  { 
    username: 'testerFriend4', 
    password: 'testest',
    firstName: 'Tester3',
    lastName: 'McTesterface',
    birthDate: new Date()
  },
  { 
    username: 'testerFriend5', 
    password: 'testest',
    firstName: 'Tester3',
    lastName: 'McTesterface',
    birthDate: new Date()
  }
];

const signUpReq = async (input, done) => {
  let user;
  await request(app)
    .post('/users/sign-up')
    .send(input)
    .set('Accept', 'application/json')
    .then(res => {
      user = res.body.user;
    })
    .catch(err => {
      done(err);
    });
  return user;
};

const logInReq = async (username, done) => {
  let token;
  await request(app)
  .post('/users/log-in')
  .send({ username: username, password: 'testest' })
  .set('Accept', 'application/json')
  .then((res) => {
    token = res.body.token;
  })
  .catch(err => {
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
  
  user4, user5 are used for auth debugging
*/
describe('Friend Request Test', () => {
  let token0, token1, token2, token3, token4, token5, user0, user1, user2, user3, user4, user5;

  beforeAll(async () => {
    // Register users
    user0 = await signUpReq(userData[0]);
    user1 = await signUpReq(userData[1]);
    user2 = await signUpReq(userData[2]);
    user3 = await signUpReq(userData[3]);
    user4 = await signUpReq(userData[4]);
    user5 = await signUpReq(userData[5]);

    // Log-in with users and record each token
    token0 = await logInReq(userData[0].username);
    token1 = await logInReq(userData[1].username);
    token2 = await logInReq(userData[2].username);
    token3 = await logInReq(userData[3].username);
    token4 = await logInReq(userData[4].username);
    token5 = await logInReq(userData[5].username);
  });

  it('User can send friend request to another user', async (done) => {
    let senderId = user0._id;
    let recipId = user1._id;

    // Create friend request with user1
    await request(app)
      .post(`/friends/${recipId}/request`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.message).toBe('success');
        expect(res.body.sender.myRequests.some(user => user.uuid === user1.uuid)).toBe(true);
        expect(res.body.recipient.pendingFriends.some(user => user.uuid === user0.uuid)).toBe(true);
      })
      .then(() => { 
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('User can accept friend request', async (done) => {
    let senderId = user0._id;
    let recipId = user2._id;

    // Send friend request from user0 to user2
    await request(app)
      .post(`/friends/${recipId}/request`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      }) // NOTE: Adding .then(() => { done() }).catch(err => { done(err) }) before the final request in multi-request test cases appear to break the suite.

    // Accept friend request
    await request(app)
      .put(`/friends/${senderId}/accept`)
      .set('Authorization', `Bearer ${token2}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('success');
        // Properly in each other's currentFriends
        expect(res.body.sender.currentFriends.some(user => user.uuid === user2.uuid)).toBe(true);
        expect(res.body.recipient.currentFriends.some(user => user.uuid === user0.uuid)).toBe(true);
        // Properly removed from pending and myrequests
        expect(res.body.sender.myRequests.some(user => user.uuid === user2.uuid)).toBe(false);
        expect(res.body.recipient.pendingFriends.some(user => user.uuid === user0.uuid)).toBe(false);
      })
      .then(() => { 
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('User can decline friend request', async (done) => {
    let senderId = user1._id;
    let recipId = user0._id;

    // Send friend request from user1 to user0
    await request(app)
      .post(`/friends/${recipId}/request`)
      .set('Authorization', `Bearer ${token1}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      })

    // user0 declines friend request from user1
    await request(app)
      .put(`/friends/${senderId}/decline`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.message).toBe('success');
        // Properly removed from pending and myrequests
        expect(res.body.sender.myRequests.some(user => user.uuid === user0.uuid)).toBe(false);
        expect(res.body.recipient.pendingFriends.some(user => user.uuid === user1.uuid)).toBe(false);
      })
      .then(() => { 
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('User can remove friend after accepting', async (done) => {
    let senderId = user0._id;
    let recipId = user3._id;

    // Send friend request from user0 to user3
    await request(app)
      .post(`/friends/${recipId}/request`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      })

    // Accept friend request
    await request(app)
      .put(`/friends/${senderId}/accept`)
      .set('Authorization', `Bearer ${token3}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      })
    
    // sender removes friend (recipient)
    await request(app)
      .put(`/friends/${recipId}/remove`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.message).toBe('success');
        // No traces of each other in all relevant fields
        expect(res.body.sender.currentFriends.some(user => user.uuid === user3.uuid)).toBe(false);
        expect(res.body.recipient.currentFriends.some(user => user.uuid === user0.uuid)).toBe(false);
        // Properly removed from pending and myrequests
        expect(res.body.sender.myRequests.some(user => user.uuid === user3.uuid)).toBe(false);
        expect(res.body.recipient.pendingFriends.some(user => user.uuid === user0.uuid)).toBe(false);
      })
      .then(() => { 
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('Properly displays pending friend list', async (done) => {
    // Send friend request from user1 to user0
    await request(app)
      .post(`/friends/${user0._id}/request`)
      .set('Authorization', `Bearer ${token1}`);
    
    // Send friend request from user2 to user0
    await request(app)
      .post(`/friends/${user0._id}/request`)
      .set('Authorization', `Bearer ${token2}`);

    // Get pending friend list
    await request(app)
      .get('/friends/pending')
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        res.body.pendingFriends.forEach((friend) => {
          expect(friend.uuid === user1.uuid || friend.uuid === user2.uuid).toBe(true);
        });
      })
      .then(() => { 
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  // Solves a bug that prevents login after sending a friend request
  it('User can still log in with a pending friend', async (done) => {
    // Send friend request from user4 to user5
    await request(app)
      .post(`/friends/${user5._id}/request`)
      .set('Authorization', `Bearer ${token4}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
      });

    // Log-out omitted since JWT-based auths don't "log out" manually unlike sessions.
    
    // Log in with user4
    await request(app)
      .post('/users/log-in')
      .send({ username: 'testerFriend4', password: 'testest' })
      .set('Accept', 'application/json')
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.user.uuid).toBe(user4.uuid);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  afterAll(async (done) => { 
    await mongoose.connection.close();
    done();
  });
});