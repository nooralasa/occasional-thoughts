var assert = require("assert");
var User = require('../models/NewUser');
var Occasion = require('../models/Occasion');
var Thought = require('../models/Thought');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');


describe('User', function () {

  beforeEach(function (done){ 
    User.remove({}, function () {
      User.create(
        {
          email: 'user1', 
          password: 'u1pw',
          firstName: 'user1',
          lastName: 'one',
          createdOccasions: [],
          viewableOccasions: []
        }, {
          email: 'user2', 
          password: 'u2pw',
          firstName: 'user2',
          lastName: 'two',
          createdOccasions: [],
          viewableOccasions: []
        }, 
        function (err) {
          Occasion.remove({}, function () {
            done();
          });
        }
      );
    });
  });

  afterEach(function (done){ 
    User.remove({}, function () {
      Occasion.remove({}, function () {
        done();
      });
    });  
  });

  describe('createNewUser()', function () {
    it('should add a user without error', function (done) {
      User.createNewUser('user3', 'u3pw', 'hello3', 'three', function (err) {
        assert.equal(err, null);
        User.find( { email: 'user3' }, function (err, users) {
          assert.notEqual(null, users);
          assert.equal(1, users.length);
          var user = users[0];
          assert.equal('user3', user.email);
          assert.equal('u3pw', user.password);
          assert.strictEqual(0, user.createdOccasions.length);
          assert.strictEqual(0, user.viewableOccasions.length);
          done();
        });
      });
    });

    it('should throw when adding a user of the same email', function (done) {
      User.createNewUser('user1', 'lasdfj', 'hello', 'hello', function (err) {
        assert.notEqual(err, null);
        assert.equal(err.taken, true);
        done();
      });
    });
  });

  describe('findByEmail()', function () {
    it('should give null when user not found', function (done) {
      User.findByEmail('aa', function (err, user) {
        assert.equal(err, null);
        assert.equal(user, null);
        done();
      });
    });

    it('should return a user when it exists', function (done) {
      User.findByEmail('user1', function (err, user) {
        assert.equal(err, null);
        assert.equal('user1', user.email);
        assert.equal('u1pw', user.password);
        assert.strictEqual(0, user.createdOccasions.length);
        assert.strictEqual(0, user.viewableOccasions.length);
        done();
      });
    });
  });

  describe('findAllByEmail()', function () {
    it('should return a user when it exists', function (done) {
      var emails = ['user1', 'user2'];
      User.findAllByEmail(emails, function (err, users) {
        assert.equal(err, null);
        assert.strictEqual(2, users.length);
        assert.equal(true, emails.indexOf(users[0].email) >= 0);
        assert.equal(true, emails.indexOf(users[1].email) >= 0);
        done();
      });
    });
  });

  describe('verifyPassword()', function () {
    it('should return true for a matching password', function (done) {
      User.verifyPassword('user1', 'u1pw', function (err, match) {
        assert.equal(err, null);
        assert.equal(match, true);
        done();
      });
    });

    it('should return false for a non-matching password', function (done) {
      User.verifyPassword('user2', 'u3pw', function (err, match) {
        assert.equal(err, null);
        assert.equal(match, false);
        done();
      });
    });

    it('should return false for a non-existent user', function (done) {
      User.verifyPassword('user3', 'u3pw', function (err, match) {
        assert.equal(err, null);
        assert.equal(match, false);
        done();
      });
    });
  });

  describe('addCreatedOccasionId()', function () {
    it("should add an occasion id to the user's list of created occasions", function (done) {
      User.findOne({email: 'user1'}, function (err, user1) {
        Occasion.create(
          {
            title: 'aa',
            creator: user1._id
          }, function (er, occasion) {
            user1.addCreatedOccasionId(occasion._id, function (e) {
              assert.equal(e, null);
              User.findOne({email: 'user1'}, function (error, user) {
                assert.equal(error, null); 
                // console.log(user.createdOccasions.indexOf(occasion._id));
                assert.equal(false, user.createdOccasions.indexOf(occasion._id) < 0);
                done();
              });
            });
          }
        );        
      });
    });
  });

  describe('addViewableOccasionId()', function () {
    it("should add an occasion id to the user's list of viewable occasions", function (done) {
      User.findOne({email: 'user1'}, function (err, user1) {
        Occasion.create(
          {
            title: 'aa',
            creator: user1._id
          }, function (er, occasion) {
            user1.addViewableOccasionId(occasion._id, function (e) {
              assert.equal(e, null);
              User.findOne({email: 'user1'}, function (error, user) {
                assert.equal(error, null); 
                assert.equal(false, user.viewableOccasions.indexOf(occasion._id) < 0);
                done();
              });
            });
          }
        );        
      });
    });
  });

});








describe('Occasion', function () {

  beforeEach(function (done){ 
    User.remove({}, function () {
      User.create(
        [{
          email: 'user1', 
          password: 'u1pw',
          firstName: 'user1',
          lastName: 'one',
          createdOccasions: [],
          viewableOccasions: []
        }, {
          email: 'user2', 
          password: 'u2pw',
          firstName: 'user2',
          lastName: 'two',
          createdOccasions: [],
          viewableOccasions: []
        }, {
          email: 'user3', 
          password: 'u3pw',
          firstName: 'user3',
          lastName: 'three',
          createdOccasions: [],
          viewableOccasions: []
        }], 
        function (err) {
          Occasion.remove({}, function () {
            User.findByEmail('user1', function (err, user) {
              Occasion.createOccasion('title0', 'descr0', 'photo0', user._id, function (er, occasion) {
                user.addCreatedOccasionId(occasion._id, function () {
                done();
                });
              });
            });
          });
        }
      );
    });
  });

  afterEach(function (done){ 
    User.remove({}, function () {
      Occasion.remove({}, function () {
        done();
      });
    });  
  });

  describe('createOccasion()', function () {
    it('should add an occasion without error', function (done) {
      User.findByEmail('user1', function (err, user) {
        Occasion.createOccasion('title1', 'descr1', 'photo1', user._id, function (er, occasion) {
          assert.equal(er, null);
          Occasion.find( { title: 'title1' }, function (e, occasions) {
            assert.notEqual(null, occasions);
            assert.equal(1, occasions.length);
            var occasion = occasions[0];
            assert.equal('title1', occasion.title);
            assert.equal('descr1', occasion.description);
            assert.equal('photo1', occasion.coverPhoto);
            assert.equal('title1', occasion.title);
            assert.equal(false, occasion.isPublished);
            assert.deepEqual(user._id, occasion.creator);
            assert.strictEqual(0, occasion.participants.length);
            assert.strictEqual(0, occasion.recipients.length);
            assert.strictEqual(0, occasion.thoughts.length);
            done();
          });
        });
      });
    });
  });

  describe('getOccasion()', function () {
    it('should get an occasion given an id', function (done) {
      User.findByEmail('user1', function (err, user) {
        Occasion.getOccasion(user.createdOccasions[0], function (e, occ) {
          assert.equal(null, e);
          assert.equal('title0', occ.title);
          assert.equal('descr0', occ.description);
          assert.equal('photo0', occ.coverPhoto);
          assert.equal('title0', occ.title);
          assert.equal(false, occ.isPublished);
          assert.deepEqual(user._id, occ.creator);
          assert.strictEqual(0, occ.participants.length);
          assert.strictEqual(0, occ.recipients.length);
          assert.strictEqual(0, occ.thoughts.length);
          done();
        });
      });
    });
  });

  describe('addParticipants()', function () {
    it('should add a list of participants to the event', function (done) {
      User.findByEmail('user1', function (err, user) {
        Occasion.getOccasion(user.createdOccasions[0], function (e, occ) {
          assert.equal(null, e);
          assert.notEqual(null, occ);
          User.findAllByEmail(['user2', 'user3'], function (err, users) {
            occ.addParticipants(users, function (error) {
              assert.equal(error, null);
              assert.equal(occ.participants.length, 2);
              assert.deepEqual(users[0]._id, occ.participants[0]);
              assert.deepEqual(users[1]._id, occ.participants[1]);
              done();
            });
          });
        });
      });
    });
  });

  describe('addRecipients()', function () {
    it('should add a list of recipients to the event', function (done) {
      User.findByEmail('user1', function (err, user) {
        Occasion.getOccasion(user.createdOccasions[0], function (e, occ) {
          assert.equal(null, e);
          assert.notEqual(null, occ);
          User.findAllByEmail(['user2', 'user3'], function (err, users) {
            occ.addRecipients(users, function (error) {
              assert.equal(error, null);
              assert.equal(occ.recipients.length, 2);
              assert.deepEqual(users[0]._id, occ.recipients[0]);
              assert.deepEqual(users[1]._id, occ.recipients[1]);
              done();
            });
          });
        });
      });
    });
  });

  describe('addThought()', function () {
    it('should add a list of recipients to the event', function (done) {
      User.findByEmail('user1', function (err, user) {
        Occasion.getOccasion(user.createdOccasions[0], function (e, occ) {
          assert.equal(null, e);
          assert.notEqual(null, occ);
          Thought.createThought('thoughtcontent', 'thoughtpic', false, user._id, function (er, thought) {
            assert.equal(e, null);
            occ.addThought(thought._id, function (error) {
              assert.equal(error, null);
              assert.equal(occ.thoughts.length, 1);
              assert.deepEqual(thought._id, occ.thoughts[0]);
              done();
            });
          });
        });
      });
    });
  });
});





describe('Thought', function () {

  beforeEach(function (done){ 
    User.remove({}, function () {
      User.create(
        [{
          email: 'user1', 
          password: 'u1pw',
          firstName: 'user1',
          lastName: 'one',
          createdOccasions: [],
          viewableOccasions: []
        }, {
          email: 'user2', 
          password: 'u2pw',
          firstName: 'user2',
          lastName: 'two',
          createdOccasions: [],
          viewableOccasions: []
        }, {
          email: 'user3', 
          password: 'u3pw',
          firstName: 'user3',
          lastName: 'three',
          createdOccasions: [],
          viewableOccasions: []
        }], 
        function (err) {
          Thought.remove({}, function () {
            done();
          });
        }
      );
    });
  });

  afterEach(function (done){ 
    User.remove({}, function () {
      Occasion.remove({}, function () {
        done();
      });
    });  
  });

  describe('createThought()', function () {
    it('should add an thought without error', function (done) {
      User.findByEmail('user1', function (err, user) {
        Thought.createThought('message1', 'photo1', false, user._id, function (er, thought) {
          assert.equal(er, null);
          Thought.find( { message: 'message1' }, function (e, thoughts) {
            assert.notEqual(null, thoughts);
            assert.equal(1, thoughts.length);
            var thought = thoughts[0];
            assert.equal('message1', thought.message);
            assert.equal('photo1', thought.photo);
            assert.equal(false, thought.isPublic);
            assert.deepEqual(user._id, thought.creator);
            done();
          });
        });
      });
    });
  });

});



