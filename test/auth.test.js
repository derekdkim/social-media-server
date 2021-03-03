const mongoose = require('mongoose');
import 'regenerator-runtime/runtime';
const request = require('supertest');
require('dotenv').config();

const app = require('./testApp');

describe('JWT Authentication Test', () => {
  beforeAll(async () => {
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
      .catch(err => {
        console.error(err);
      })
  });

  it('Cannot access secure route without auth header', async () => {
    await request(app)
      .get('/entries/all')
      .then((res) => {
        expect(res.statusCode).toBe(401);
      });
  });

  it('Access secure route using JWT auth header', async () => {
    let token;
    // Log-in
    await request(app)
      .post('/users/log-in')
      .send({
        username: process.env.AUTH_TEST_USERNAME,
        password: process.env.AUTH_TEST_PASSWORD,
      })
      .set('Accept', 'application/json')
      .then((res) => {
        token = res.body.token;
      })
      .catch((err, done) => {
        console.log(err);
        done(err);
      });

    // Access secure route
    await request(app)
      .get('/entries/')
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body.message).toBe('Secure route access granted');
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