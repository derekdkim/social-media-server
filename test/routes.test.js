const indexRouter = require('../routes/index');

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use('/', indexRouter);

describe('Server Routing Test', () => {
  it('GET index route', done => {
    request(app)
      .get('/')
      .expect(200, done);
  });

  it('GET sign-up route', done => {
    request(app)
      .get('/sign-up')
      .expect(200, done);
  });

  it('POST sign-up route', done => {
    request(app)
      .post('/sign-up')
      .expect(200, done);
  });

  it('GET log-in route', done => {
    request(app)
      .get('/log-in')
      .expect(200, done);
  });

  it('POST log-in route', done => {
    request(app)
      .post('/log-in')
      .expect(200, done);
  });
});