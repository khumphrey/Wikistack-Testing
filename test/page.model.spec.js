'use strict';

const chai = require('chai'),
  mocha = require('mocha'),
  expect = chai.expect,
  should = chai.should(),
  Page = require('../models').Page,
  chaiAsPromised = require('chai-as-promised'),
  chaiThings = require('chai-things');

chai.use(chaiAsPromised);
chai.use(chaiThings);

describe('Page model', function () {
  before(function () {
    return Page.sync({ force: true });
  });

  after(function () {
    return Page.truncate();
  });

  describe('Virtuals', function () {
    let newPage;
    beforeEach(function () {
      newPage = Page.build({
        title: 'YDKJS',
        urlTitle: 'reallyYouDoNot',
        content: 'This is the beginning of the End'
      })
    });

    describe('route', function () {
      it('returns the url_name prepended by "/wiki/"', function () {
        expect(newPage.route).to.equal('/wiki/reallyYouDoNot');
      });
    });
    describe('renderedContent', function () {
      it('converts the markdown-formatted content into HTML', function () {
        expect(newPage.renderedContent).to.equal('<p>This is the beginning of the End</p>\n');
      });
    });
  });

  describe('Class methods', function () {

    beforeEach(function () {
      return Page.truncate()
        .then(() => {
          Page.create({
            title: 'YDKJS',
            content: 'This is the beginning of the End',
            tags: 'JS, Closure, Infinite Loop'
          })
        })
    });

    describe('findByTag', function () {
      it('gets pages with the search tag', function () {
        return Page.findByTag('JS')
          .then(pagesArr => {
            expect(pagesArr.length).to.equal(1);
          })
      });
      it('does not get pages without the search tag', function () {
        return Page.findByTag().should.eventually.have.length(0);
      });
    });
  });

  describe('Instance methods', function () {
    let page1, page3;
    beforeEach(function () {
      return Page.truncate()
        .then(() => {
          Promise.all([
            Page.create({
              title: 'YDKJS',
              content: 'This is the beginning of the End',
              tags: 'JS, Closure, Infinite Loop'
            }),
            Page.create({
              title: 'Cracking the Code',
              content: 'Will the code crack you?',
              tags: 'JS, Algorithms',
            }),
            Page.create({
              title: 'AI revolution',
              content: 'Who will rule who?',
              tags: 'AI'
            })
          ])
        })
        .then(createdPages => {
          page1 = createdPages[0];
          page3 = createdPages[2];
        });
    });

    describe('findSimilar', function () {
      it('never gets itself', function () {
        return page3.findSimilar().should.eventually.have.length(0);
      });
      it('gets other pages with any common tags', function () {
        return page1.findSimilar().should.eventually.be.an('array').with.deep.property('[0].title', 'Cracking the Code');
      });
      it('does not get other pages without any common tags', function () {
        return page3.findSimilar().should.eventually.have.length(0);
      });
    });
  });

  describe('Validations', function () {
    let newPage;
    beforeEach(function () {
      newPage = {
        title: 'YDKJS',
        urlTitle: 'reallyYouDoNot',
        content: 'This is the beginning of the End'
      };
    });

    it('errors without title', function () {
      delete newPage.title;
      newPage = Page.build(newPage);
      return newPage.validate()
        .then(err => {
          expect(err.errors[0].path).to.equal('title');
        })
    });
    it('errors without content', function () {
      delete newPage.content;
      newPage = Page.build(newPage);
      return newPage.validate()
        .then(err => {
          expect(err.errors[0].path).to.equal('content');
        })
    });
    it('errors given an invalid status', function () {
      newPage.status = 'fail';
      return Page.create(newPage)
        .catch(err => err.should.exist)
    });
  });

  describe('Hooks', function () {
    it('it sets urlTitle based on title before validating', function () {
      let page = Page.build({
        title: 'Cracking the Code',
        content: 'Will the code crack you?'
      });
      return page.save().should.eventually.have.property('urlTitle', 'Cracking_the_Code');
    });
  });

});