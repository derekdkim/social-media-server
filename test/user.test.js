const mongoose = require('mongoose');
import 'regenerator-runtime/runtime';
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const userData = { 
  username: 'tester123', 
  password: 'hunter2',
  firstName: 'Tester',
  lastName: 'McTesterface',
  birthDate: new Date()
}

describe('User Model Test', () => {
  // Connect to the MongoDB Memory Server
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
  });

  it('User registration successful', async () => {
    const mockUser = new User(userData);
    const savedUser = await mockUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.password).toEqual(expect.anything());
    expect(savedUser.firstName).toBe(userData.firstName);
    expect(savedUser.lastName).toBe(userData.lastName);
    expect(savedUser.birthDate).toBe(userData.birthDate);
    expect(savedUser.currentFriends.length).toBe(0);
    expect(savedUser.pendingFriends.length).toBe(0);
  });

  it('User cannot register if required value is missing', async () => {
    const invalidUser = new User({ username: 'test1234', password: 'thisShouldFail' });
    let err;
    try {
      const saveAttempt = await invalidUser.save();
      error = saveAttempt;
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.firstName).toBeDefined();
  });

  afterAll(done => {
    mongoose.connection.close();
    done();
  });
});