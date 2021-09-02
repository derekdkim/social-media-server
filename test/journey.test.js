const mongoose = require('mongoose');
import 'regenerator-runtime/runtime';
import user from '../models/user';
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
    username: 'privacyTestUser', 
    password: 'testest',
    firstName: 'Tester',
    lastName: 'McTesterface',
    birthDate: new Date()
  },
  { 
    username: 'friendsOnlyTestUser', 
    password: 'testest',
    firstName: 'Tester',
    lastName: 'McTesterface',
    birthDate: new Date()
  }
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
    privacy: 0
  },
  {
    title: 'Friends-only Journey',
    privacy: 1
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

describe('Journey Test', () => {
  let user0, user1, user2, user3, token0, token1, token2, token3;

  beforeAll( async () => {
    user0 = await signUpReq(userData[0]);
    user1 = await signUpReq(userData[1]);
    user2 = await signUpReq(userData[2]);
    user3 = await signUpReq(userData[3]);

    token0 = await logInReq(userData[0].username);
    token1 = await logInReq(userData[1].username);
    token2 = await logInReq(userData[2].username);
    token3 = await logInReq(userData[3].username);
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
      .catch(err => {
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
      })
      .then(() => {
        done();
      })
      .catch(err => {
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
      .catch(err => {
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
      .catch(err => {
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
      .catch(err => {
        done(err);
      });
    
    // Edit journey
    await request(app)
      .put(`/journeys/${oldJourneyId}`)
      .set('Authorization', `Bearer ${token0}`)
      .send(newJourney)
      .then((res) => {
        expect(res.body.message).toBe('success');
        expect(res.body.journey.title).toBe('New Title');
        expect(res.body.journey.privacy).toBe(2);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('Users can delete their journeys', async (done) => {
    let journeyId, entryId;

    let childText = { text: 'Something something text.' };

    // Create journey
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        journeyId = res.body.journey._id;
      })
      .catch(err => {
        done(err);
      });

    // Create entry #1
    await request(app)
      .post(`/entries/${journeyId}/new`)
      .set('Authorization', `Bearer ${token0}`)
      .send(childText)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        entryId = res.body.entry._id;
      })
      .catch(err => {
        done(err);
      });
    
    // Create entry #2
    await request(app)
      .post(`/entries/${journeyId}/new`)
      .set('Authorization', `Bearer ${token0}`)
      .send(childText)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });
    
    // Create comment
    await request(app)
      .post(`/comments/${entryId}/new`)
      .set('Authorization', `Bearer ${token0}`)
      .send(childText)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });

    // Delete journey
    await request(app)
      .delete(`/journeys/${journeyId}`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('delete success');
        expect(res.body.entryCount).toBe(2);
        expect(res.body.commentCount).toBe(1);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        console.log('delete failed');
        done(err);
      });
  });

  it('User can remove the dueDate from their journey', async (done) => {
    let journeyId;

    // Create journey with user0
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[1])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.journey.dueDate).toBeTruthy();
        journeyId = res.body.journey._id;
      })
    
    // Remove due date
    await request(app)
      .put(`/journeys/${journeyId}/remove-due-date`)
      .set('Authorization', `Bearer ${token0}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.journey.dueDate).toBeUndefined();
      })
      .then(() => {
        done();
      })
      .catch(err => {
        console.log('Failed');
        done(err);
      })
  });

  it('User can view public journeys from other users', async (done) => {
    let refJourney;

    // Create journey with user0
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        refJourney = res.body.journey;
      })
      .catch(err => {
        done(err);
      });
    
    // View journey with user1
    await request(app)
      .get('/journeys/all')
      .set('Authorization', `Bearer ${token1}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.journeys.length).toBeGreaterThan(0);
        expect(res.body.journeys.some(journey => journey.title === refJourney.title)).toBe(true);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('User cannot view friends-only journeys of non-friends', async (done) => {
    let refJourney;

    // Create journey with user0
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[2])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        refJourney = res.body.journey;
      })
      .catch(err => {
        done(err);
      });
    
    // View journey with user1
    await request(app)
      .get('/journeys/friends')
      .set('Authorization', `Bearer ${token1}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.journeys.some(journey => journey.title === refJourney.title)).toBe(false);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('User can view their friends journeys but not their private journeys', async (done) => {
    // Friend request
    await request(app)
      .post(`/friends/${user1._id}/request`)
      .set('Authorization', `Bearer ${token2}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });

    // Accept friend
    await request(app)
      .put(`/friends/${user2._id}/accept`)
      .set('Authorization', `Bearer ${token1}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });

    // Create friends-only journey
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token1}`)
      .send(testInput[2])
      .then(res => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });

    // Create private journey
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token1}`)
      .send(testInput[3])
      .then(res => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });
    
    // View journeys with user0
    await request(app)
      .get('/journeys/all')
      .set('Authorization', `Bearer ${token2}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        // User should not be able to view the private journey
        expect(res.body.journeys.every(journey => journey.privacy != 2)).toBe(true);
        // User should be able to view the friends only journey
        expect(res.body.journeys.some(journey => journey.privacy === 1)).toBe(true);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('User can see their own private journeys', async (done) => {
    // Create private journey
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token1}`)
      .send(testInput[3])
      .then(res => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });
    
    // View private journey with public view
    await request(app)
      .get('/journeys/all')
      .set('Authorization', `Bearer ${token1}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        // At least 1 journey is private and is their own
        expect(res.body.journeys.some(journey => journey.privacy === 2 && journey.author.uuid === user1.uuid)).toBe(true);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('Friends only view does not show non-friends journeys', async (done) => {
    // Friend request
    await request(app)
      .post(`/friends/${user3._id}/request`)
      .set('Authorization', `Bearer ${token1}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });

    // Accept friend
    await request(app)
      .put(`/friends/${user1._id}/accept`)
      .set('Authorization', `Bearer ${token3}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });
    
    // Create friends-only journey
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token1}`)
      .send(testInput[2])
      .then(res => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });
    
    // View only friends journeys
    await request(app)
      .get('/journeys/friends')
      .set('Authorization', `Bearer ${token3}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        // Every journey's author should be in the author's friend list
        expect(res.body.journeys.every(journey => journey.author.uuid === user1.uuid )).toBe(true);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it("My journeys only returns user's journey", async (done) => {
    // Create new journey for user 0
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[0])
      .then(res => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });
      
    // Create a new public journey for user 1
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token1}`)
      .send(testInput[0])
      .then(res => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });

    // Create a new private journey for user 1
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token1}`)
      .send(testInput[3])
      .then(res => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });
    
    // Display my journeys only
    await request(app)
      .get('/journeys/private')
      .set('Authorization', `Bearer ${token1}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        // Every journey in the results must have user 1 as its author
        expect(res.body.journeys.every(journey => journey.author.uuid === user1.uuid)).toBe(true);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('Users can like a journey if they have not already liked it', async (done) => {
    let journeyId;

    // Create new journey for user 0
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[0])
      .then(res => {
        expect(res.statusCode).toBe(200);
        journeyId = res.body.journey._id;
      })
      .catch(err => {
        done(err);
      });
    
    // user 1 likes user 0's journey
    await request(app)
      .put(`/journeys/like/${journeyId}`)
      .set('Authorization', `Bearer ${token1}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.likedBy.includes(user1.uuid)).toBe(true);
        expect(res.body.likedCount).toBeGreaterThan(0);        
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('Users can unlike a journey they previously liked', async (done) => {
    let journeyId;

    // Create new journey for user 0
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[0])
      .then(res => {
        expect(res.statusCode).toBe(200);
        journeyId = res.body.journey._id;
      });
    
    // User 1 likes user 0's journey
    await request(app)
      .put(`/journeys/like/${journeyId}`)
      .set('Authorization', `Bearer ${token1}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });
    
    // User 1 unlikes said journey
    await request(app)
      .put(`/journeys/unlike/${journeyId}`)
      .set('Authorization', `Bearer ${token1}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.likedBy).toStrictEqual([]);
        expect(res.body.likedCount).toBe(0);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('The author of the journey cannot join the journey', async (done) => {
    let journeyId;

    // Create new journey for user 0
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[0])
      .then(res => {
        expect(res.statusCode).toBe(200);
        journeyId = res.body.journey._id;
      });
    
    // User 0 attempts to join their own journey
    await request(app)
      .put(`/journeys/join/${journeyId}`)
      .set('Authorization', `Bearer ${token0}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('The author of the journey cannot join or leave. They must delete the journey to remove it.');
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Other users can join and leave a journey', async (done) => {
    let journeyId;

    // Create new journey for user 0
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[0])
      .then(res => {
        expect(res.statusCode).toBe(200);
        journeyId = res.body.journey._id;
      });
    
    // User 1 attempts to join the above journey
    await request(app)
      .put(`/journeys/join/${journeyId}`)
      .set('Authorization', `Bearer ${token1}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('success');
        expect(res.body.participants.includes(user1.uuid)).toBe(true);
      })
      .catch((err) => {
        done(err);
      });
    
    // User 1 attempts to leave the journey
    await request(app)
      .put(`/journeys/leave/${journeyId}`)
      .set('Authorization', `Bearer ${token1}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('success');
        expect(res.body.participants.includes(user1.uuid)).toBe(false);
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });

  });

  it('Users can display journeys they are a participant of', async (done) => {
    let refJourney;

    // Create new journey for user 0
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token0}`)
      .send(testInput[1])
      .then(res => {
        expect(res.statusCode).toBe(200);
        refJourney = res.body.journey;
      });
    
    // User 1 attempts to join the above journey
    await request(app)
      .put(`/journeys/join/${refJourney._id}`)
      .set('Authorization', `Bearer ${token1}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('success');
        expect(res.body.participants.includes(user1.uuid)).toBe(true);
      })
      .catch((err) => {
        done(err);
      });
    
    // Display participating journeys for user 1
    await request(app)
      .get('/journeys/participating')
      .set('Authorization', `Bearer ${token1}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        res.body.journeys.forEach(journey => {
          expect(journey.title).toBe(refJourney.title);
        });
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