import 'regenerator-runtime/runtime';
const request = require('supertest');
require('dotenv').config();

const indexRouter = require('../routes/entries');
const app = require('./testApp');

describe('JWT Authentication Test', () => {
  let token;

  beforeAll((done) => {
    request(app)
      .post('/log-in')
      .send({
        username: process.env.AUTH_TEST_USERNAME,
        password: process.env.AUTH_TEST_PASSWORD
      })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  it('Cannot access secure route without auth header', () => {
    return request(app)
      .get('/entries/all')
      .then((res) => {
        expect(res.statusCode).toBe(401);
      });
  });

  it('Access secure route using JWT auth header', () => {
    return request(app)
      .get('/users/')
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toBe('text/html');
      });
  });

  afterAll(() => { 
    mongoose.connection.close();
  })
});