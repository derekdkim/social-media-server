import 'regenerator-runtime/runtime';
const request = require('supertest');
require('dotenv').config();

const indexRouter = require('../routes/index');
const app = require('../app');

// describe('Server Routing Test', () => {
//   it('GET index route', done => {
//     request(app)
//       .get('/')
//       .expect(200, done);
//   });

//   it('GET sign-up route', done => {
//     request(app)
//       .get('/sign-up')
//       .expect(200, done);
//   });

//   it('POST sign-up route', done => {
//     request(app)
//       .post('/sign-up')
//       .send(userData)
//       .expect(200, done);
//   });

//   it('GET log-in route', done => {
//     request(app)
//       .get('/log-in')
//       .expect(200, done);
//   });

//   it('POST log-in route', done => {
//     request(app)
//       .post('/log-in')
//       .send({ username: 'tester123', password: 'hunter2' })
//       .expect(200, done);
//   });
// });

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
      .get('/users/')
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
});