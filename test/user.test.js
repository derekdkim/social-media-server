const mongoose = require('mongoose');
import 'regenerator-runtime/runtime';
const request = require('supertest');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = require('./testApp');
const User = require('../models/user');

const userData = [
  { 
    username: 'testerUserEditor0', 
    password: 'testest',
    firstName: 'Tester0',
    lastName: 'McTesterface',
    birthDate: new Date()
  },
  {
    username: 'testerUserEditor1', 
    password: 'testest',
    firstName: 'Tester1',
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

describe('User Data Editing Test', () => {
  let user0, user1, token0, token1;

  beforeAll(async () => {
    // Register user
    user0 = await signUpReq(userData[0]);
    user1 = await signUpReq(userData[1]);

    // Log-in with user and record token
    token0 = await logInReq(userData[0].username);
    token1 = await logInReq(userData[1].username);
  });

  it('User can fetch their own data for their profile page', async (done) => {
    await request(app)
      .get('/users/get-myself')
      .set('Authorization', `Bearer ${token0}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('success');
        expect(res.body.user.uuid).toBe(user0.uuid);
        expect(res.body.user.currentFriends).toStrictEqual([]);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('User can edit name', async (done) => {
    await request(app)
      .put('/users/edit')
      .set('Authorization', `Bearer ${token0}`)
      .send({ firstName: 'John', lastName: 'Doe' })
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.user.firstName).toBe('John');
        expect(res.body.user.lastName).toBe('Doe');
        // User birthdate remains the same
        expect(res.body.user.birthDate).toBe(user0.birthDate);
        expect(res.body.user.uuid).toBe(user0.uuid);
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        console.log('Error: Edit request failed.');
        done(err);
      });
  });

  it('User can edit name and birthdate', async (done) => {
    await request(app)
      .put('/users/edit')
      .set('Authorization', `Bearer ${token1}`)
      .send({ firstName: 'James', lastName: 'Dee', birthDate: new Date(1990, 2) })
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.user.firstName).toBe('James');
        expect(res.body.user.lastName).toBe('Dee');
        expect(new Date(res.body.user.birthDate)).toStrictEqual(new Date(1990, 2));
        expect(res.body.user.uuid).toBe(user1.uuid);
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        console.log('Error: Edit request failed.');
        done(err);
      });
  });

  it('User can change their intro', async (done) => {
    await request(app)
      .put('/users/edit')
      .set('Authorization', `Bearer ${token0}`)
      .send({ intro: 'This is edited.' })
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.user.intro).toBe('This is edited.');
        expect(res.body.user.uuid).toBe(user0.uuid);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        console.log('Error: Edit request failed.');
        done(err);
      })
  });

  it('User can change password', async (done) => {
    await request(app)
      .put('/users/edit-pw')
      .set('Authorization', `Bearer ${token0}`)
      .send({ currentPassword: 'testest', newPassword: 'changedPassword101' })
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('success');
        // Validate password hash
        bcrypt.compare('changedPassword101', res.body.user.password, (err, res) => {
          expect(res).toBe(true);
        });
        expect(res.body.user.uuid).toBe(user0.uuid);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        console.log('Error: Edit request failed.');
        done(err);
      });
  });

  it('User can delete account', async (done) => {
    // Delete Account
    await request(app)
      .delete('/users/delete-account')
      .set('Authorization', `Bearer ${token1}`)
      .send({ currentPassword: 'testest' })
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('success');
      })
      .catch(err => {
        console.log('Error: Delete request failed.');
        done(err);
      });
    
    // Expect failed authentication
    await request(app)
      .get('/journeys/all')
      .set('Authorization', `Bearer ${token1}`)
      .then(res => {
        expect(res.statusCode).toBe(401);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('Can fetch another users info', async (done) => {
    await request(app)
      .get(`/users/${user0._id}`)
      .set('Authorization', `Bearer ${token1}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.user.uuid).toBe(user0.uuid);
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