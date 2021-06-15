const mongoose = require('mongoose');
import { ExpectationFailed } from 'http-errors';
import 'regenerator-runtime/runtime';
const request = require('supertest');

const app = require('./testApp');
const User = require('../models/user');
const Entry = require('../models/entry');
const Comment = require('../models/comment');

const userData = { 
  username: 'commentTestUser', 
  password: 'testest',
  firstName: 'Tester0',
  lastName: 'McTesterface',
  birthDate: new Date()
};

const testInput = [
  {
    text: 'Just testing comments'
  },
  {
    text: 'Just editing comments'
  },
  {
    text: 'First comment'
  },
  {
    text: 'Second comment'
  },
  {
    text: 'Third comment'
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

describe('Comment Test', () => {
  let user, token, parentJourney, parentEntry;
  beforeAll( async (done) => {
    user = await signUpReq(userData);
    token = await logInReq(userData.username);

    // Create journey
    await request(app)
      .post('/journeys/new')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Parent Journey',
        privacy: 0
      })
      .then((res) => {
        parentJourney = res.body.journey;
      })
      .catch(err => {
        done(err);
      });

    // Create parent entry
    await request(app)
      .post(`/entries/${parentJourney._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        text: 'Parent Entry'
      })
      .then((res) => {
        parentEntry = res.body.entry;
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('Users can create comment using parent entry ID', async (done) => {
    // Create comment
    await request(app)
      .post(`/comments/${parentEntry._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.comment.author._id).toBe(user._id);
        expect(res.body.comment.text).toBe(testInput[0].text);
        expect(res.body.comment.parent._id).toBe(parentEntry._id);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('Users can edit their comments', async (done) => {
    let commentID;
    // Create comment
    await request(app)
      .post(`/comments/${parentEntry._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        commentID = res.body.comment._id;
      })
      .catch(err => {
        done(err);
      });
    
    // Edit comment
    await request(app)
      .put(`/comments/${commentID}`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[1])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.comment._id).toBe(commentID);
        expect(res.body.comment.author).toBe(user._id);
        expect(res.body.comment.text).toBe(testInput[1].text);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('Users can delete their comments', async (done) => {
    let commentID;
    // Create comment
    await request(app)
      .post(`/comments/${parentEntry._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[0])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        commentID = res.body.comment._id;
      })
      .catch(err => {
        done(err);
      });
    
    // Delete comment
    await request(app)
      .delete(`/comments/${commentID}`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('success');
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('Can fetch all comments in an entry', async (done) => {
    let commentArr = [];
    // Create comment #1
    await request(app)
      .post(`/comments/${parentEntry._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[2])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        commentArr.push(res.body.comment);
      })
      .catch(err => {
        done(err);
      });
    
    // Create comment #2
    await request(app)
      .post(`/comments/${parentEntry._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[3])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        commentArr.push(res.body.comment);
      })
      .catch(err => {
        done(err);
      });

    // Create comment #3
    await request(app)
      .post(`/comments/${parentEntry._id}/new`)
      .set('Authorization', `Bearer ${token}`)
      .send(testInput[4])
      .then((res) => {
        expect(res.statusCode).toBe(200);
        commentArr.push(res.body.comment);
      })
      .catch(err => {
        done(err);
      });
    
    await request(app)
      .get(`/comments/${parentEntry._id}/all`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining(commentArr));
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  afterAll( async (done) => {
    await mongoose.connection.close();
    done();
  });
});