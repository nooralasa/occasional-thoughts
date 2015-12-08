var assert = require("assert");
var User = require('../models/User');
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
          token: 'u1pw',
          fbid: 'user1',
          name: 'one',
          profilePicture: '',
          createdOccasions: [],
          participatedOccasions: [],
          receivedOccasions: []
        }, {
          email: 'user2', 
          token: 'u2pw',
          fbid: 'user2',
          name: 'two',
          profilePicture: '',
          createdOccasions: [],
          participatedOccasions: [],
          receivedOccasions: []
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
      User.createNewUser('user3', 'u3pw', 'hello3', 'three', 'pic', function (err) {
        assert.equal(err, null);
        User.find( { email: 'user3' }, function (err, users) {
          assert.notEqual(null, users);
          assert.equal(1, users.length);
          var user = users[0];
          assert.equal('user3', user.email);
          assert.equal('u3pw', user.token);
          assert.strictEqual(0, user.createdOccasions.length);
          assert.strictEqual(0, user.participatedOccasions.length);
          assert.strictEqual(0, user.receivedOccasions.length);
          done();
        });
      });
    });

    it('should throw when adding a user of the same email', function (done) {
      User.createNewUser('user1', 'lasdfj', 'hello', 'hello', 'pic1', function (err) {
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
        assert.equal('u1pw', user.token);
        assert.strictEqual(0, user.createdOccasions.length);
          assert.strictEqual(0, user.participatedOccasions.length);
          assert.strictEqual(0, user.receivedOccasions.length);
        done();
      });
    });
  });

  describe('findAllByFbid()', function () {
    it('should return a user when it exists', function (done) {
      var fbids = ['user1', 'user2'];
      User.findAllByFbid(fbids, function (err, users) {
        assert.equal(err, null);
        assert.strictEqual(2, users.length);
        assert.equal(true, fbids.indexOf(users[0].email) >= 0);
        assert.equal(true, fbids.indexOf(users[1].email) >= 0);
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

  describe('addReceivedOccasionId()', function () {
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



  describe('removeOccasionFromAll()', function () {
    it("should remove an occasion id to the user's list of created occasions", function (done) {
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

                User.removeOccasionFromAll(occasion._id, user._id, [], function (error1) {
                  assert.equal(null, error1);
                  User.findByEmail('user1', function (error2, currentUser) {
                    assert.equal(true, currentUser.createdOccasions.indexOf(occasion._id) < 0);
                    done();
                  });
                });
              });
            });
          }
        );
      });
    });
  });

});

