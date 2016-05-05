'use strict';

const chai = require('chai'),
  mocha = require('mocha'),
  expect = chai.expect,
  should = chai.should(),
  Page = require('../models').Page,
  User = require('../models').User,
  supertest = require('supertest-as-promised'),
  agent = supertest.agent(require('../app')),
  chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('http requests', function () {

  beforeEach(function () {
    return User.sync({ force: true })
      .then(() => Page.sync({ force: true }))
  });

  describe('GET /wiki', function () {

    it('responds with 200', function () {
      return agent
        .get('/')
        .expect(200);
    });

  });

  describe('GET /wiki/add', function () {

    it('responds with 200', function () {
      return agent
        .get('/wiki/add')
        .expect(200);
    });

  });

  describe('GET /wiki/:urlTitle', function () {

    it('responds with 404 on page that does not exist', function () {
      return agent
        .get('/wiki/dne')
        .expect(404);
    });

    it('responds with 200 on page that does exist', function () {
      return Page.create({
          title: 'Cracking the Code',
          content: 'Will the code crack you?'
        })
        .then(function (createdPage) {

          return agent
            .get('/wiki/' + createdPage.urlTitle)
            .expect(200);
        });
    });

  });

  describe('GET /wiki/search', function () {

    it('responds with 200', function () {
      return agent
        .get('/wiki/search')
        .expect(200);
    });

  });

  describe('GET /wiki/:urlTitle/similar', function () {

    it('responds with 404 for page that does not exist', function () {
      return agent
        .get('/wiki/DNE')
        .expect(404);
    });

    it('responds with 200 for similar page', function () {
      return Page.create({
          title: 'YDKJS',
          content: 'This is the beginning of the End'
        })
        .then(function () {
          return agent
            .get('/wiki/YDKJS/similar')
            .expect(200);
        });
    });

  });

  describe('POST /wiki', function () {

    it('responds with 302', function () {
      return agent
        .post('/wiki/')
        .send({
          name: 'Kate',
          email: 'JS@gmail.com',
          title: 'YDKJS',
          content: 'This is the beginning of the End'
        })
        .expect(302);
    });

    it('creates a page in the database', function () {
      return agent
        .post('/wiki/')
        .send({
          name: 'Kate',
          email: 'JS@gmail.com',
          title: 'YDKJS',
          content: 'This is the beginning of the End'
        })
        .then(function () {
          return Page.findAll().should.eventually.have.length(1).should.eventually.have.deep.property('[0].title', 'YDKJS')
        })
    });

  });

});