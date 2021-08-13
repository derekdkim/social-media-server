const mongoose = require('mongoose');
import 'regenerator-runtime/runtime';
const request = require('supertest');
require('dotenv').config();

const app = require('./testApp');

const userData = { 
  username: 'entryTestUser', 
  password: 'testest',
  firstName: 'Tester0',
  lastName: 'McTesterface',
  birthDate: new Date()
};

const testInput = [
  {
    text: 'Just testing an entry'
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

describe('Entry Test', () => {
  let token, user, parentJourney;
  beforeAll(async (done) => {
    // Authenticate user
    user = await signUpReq(userData);
    token = await logInReq(userData.username);

    // Create parent journey
    await request(app)
      .post('/journeys/new')
      .send({
        title: 'Min Test Journey',
        privacy: 0
      })
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        parentJourney = res.body.journey;
        done();
      });
  });

  it('Cannot create post if not logged in', async (done) => {
    // Attempt to create entry. Should not work as user is unauthenticated
    await request(app)
      .post(`/entries/${parentJourney._id}/new`)
      .send({
        text: 'testing'
      })
      .set('Accept', 'applicaton/json')
      .then((res) => {
        expect(res.statusCode).toBe(401);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('User can create post with JWT', async (done) => {

    // Create entry
    await request(app)
      .post(`/entries/${parentJourney._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.entry.text).toBe('Just testing an entry');
        expect(res.body.entry.author._id).toStrictEqual(user._id);
        expect(res.body.entry.parent._id).toStrictEqual(parentJourney._id);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('User can edit their entry', async (done) => {
    let entryID;

    // Create entry
    await request(app)
      .post(`/entries/${parentJourney._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        entryID = res.body.entry._id;
      })
      .catch(err => {
        done(err);
      });
    
    // Edit entry
    await request(app)
      .put(`/entries/${parentJourney._id}/${entryID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Changed an entry' })
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.entry.text).toStrictEqual('Changed an entry');
        expect(res.body.entry.author).toStrictEqual(user._id);
        expect(res.body.entry._id).toBe(entryID);
        expect(res.body.entry.parent).toStrictEqual(parentJourney._id);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('User can delete their entry along with child comments', async(done) => {
    let entryID;

    // Create entry
    await request(app)
      .post(`/entries/${parentJourney._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        entryID = res.body.entry._id;
      })
      .catch(err => {
        done(err);
      });

    // Create comment #1
    await request(app)
      .post(`/comments/${entryID}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });
    
    // Create comment #2
    await request(app)
      .post(`/comments/${entryID}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
      })
      .catch(err => {
        done(err);
      });
    
    // Delete entry
    await request(app)
      .delete(`/entries/${parentJourney._id}/${entryID}`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('success');
        expect(res.body.commentCount).toBe(2);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('User can like and dislike entries', async (done) => {
    let entryId;

    // Create entry
    await request(app)
      .post(`/entries/${parentJourney._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        entryId = res.body.entry._id;
      })
      .catch(err => {
        done(err);
      });
    
    // Like entry as the same user
    await request(app)
      .put(`/entries/${parentJourney._id}/${entryId}/like`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.likedBy.includes(user.uuid)).toBe(true);
        expect(res.body.likedCount).toBeGreaterThan(0);
      })
      .catch(err => {
        done(err);
      });
    
    // Unlike entry
    await request(app)
      .put(`/entries/${parentJourney._id}/${entryId}/unlike`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
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

  it('User can view all entries in a journey', async (done) => {
    let entryId, refEntry;

    // Create an entry
    await request(app)
      .post(`/entries/${parentJourney._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        entryId = res.body.entry._id;
        refEntry = res.body.entry;
      })
      .catch(err => {
        done(err);
      });
    
    // View all entries and look for the previously created entry
    await request(app)
      .get(`/entries/${parentJourney._id}/all`)
      .set('Authorization', `Bearer ${token}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.entries.length).toBeGreaterThan(0);
        expect(res.body.entries.some(entry => entry._id === refEntry._id)).toBe(true);
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