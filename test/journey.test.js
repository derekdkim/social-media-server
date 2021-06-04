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
];

const testInput = [
  {
    title: 'Min Test Journey',
    privacy: 0
  },
  {
    title: 'Optionals Test Journey',
    desc: 'This is a simple test description.',
    dueDate: new Date(2021, 11, 17),
    tags: ['test', 'art', 'life'],
    privacy: 0
  },
  {
    title: 'Private Journey',
    privacy: 2
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
    .catch((err) => {
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
  .catch((err) => {
    done(err);
  });
  return token;
}

describe('Journey Test', () => {
  let user0, user1, token0, token1;

  beforeAll( async () => {
    user0 = await signUpReq(userData[0]);
    user1 = await signUpReq(userData[1]);

    token0 = await logInReq(userData[0].username);
    token1 = await logInReq(userData[1].username);
  });


  it('User can successfully create a journey with only the required input', async (done) => {
    request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.body.message).toBe('success');
        expect(res.body.journey.author._id).toStrictEqual(user0._id);
        expect(res.body.journey.title).toBe('Min Test Journey');
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('User can create a journey with all optional inputs', async (done) => {
    request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[1])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('success');
        expect(res.body.journey.author._id).toStrictEqual(user0._id);
        expect(res.body.journey.title).toBe('Optionals Test Journey');
        expect(res.body.journey.desc).toStrictEqual(testInput[1].desc);
        expect(new Date(res.body.journey.timestamp).getTime()).not.toBe(NaN);
        expect(new Date(res.body.journey.dueDate).getTime()).not.toBe(NaN);
        expect(res.body.journey.tags).toEqual(expect.arrayContaining(['life', 'test']));
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('User can get their journey details', async (done) => {
    let journeyId;

    // Create journey
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        journeyId = res.body.journey._id;
      })
      .catch((err) => {
        done(err);
      });
    
    // Get journey
    await request(app)
      .get(`/journeys/${journeyId}`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.journey.author).toStrictEqual(user0);
        expect(res.body.journey.title).toBe(testInput[0].title);
        expect(res.body.journey.privacy).toBe(0);
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('User can edit their journey', async (done) => {
    let oldJourneyId;
    let oldJourney = {
      title: 'Old Title',
      privacy: 0
    };

    let newJourney = {
      title: 'New Title',
      privacy: 2
    };

    // Create journey
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(oldJourney)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        oldJourneyId = res.body.journey._id;
      })
      .catch((err) => {
        done(err);
      });
    
    // Edit journey
    await request(app)
      .put(`/journeys/${oldJourneyId}`)
      .set('Authorization', `Bearer ${token0}`)
      .send(newJourney)
      .then((res) => {
        expect(res.body.message).toBe('edit success');
        expect(res.body.journey.title).toBe('New Title');
        expect(res.body.journey.privacy).toBe(2);
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Users can delete their journeys', async (done) => {
    let journeyId;

    // Create journey
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        journeyId = res.body.journey._id;
      })
      .catch((err) => {
        done(err);
      });

    // Delete journey
    await request(app)
      .delete(`/journeys/${journeyId}`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('delete success');
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        console.log('delete failed');
        done(err);
      });
  });

  afterAll(async (done) => {
    await mongoose.connection.close();
    done();
  });
});