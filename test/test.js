var assert = require("assert");
var User = require('../models/User');
var Tweet = require('../models/Tweet');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fritter_test');

describe('User', function () {

  beforeEach(function (done){ 
    User.remove({}, function () {
      User.create(
        {
          username: 'user0', 
          password: 'u0pw',
          tweets: [],
          follows: []
        }, {
          username: 'user1', 
          password: 'u1pw',
          tweets: [],
          follows: []
        }, 
        function (err) {
          Tweet.remove({}, function () {
            done();
          });
        }
      );
    });
  });

  afterEach(function (done){ 
    User.remove({}, function () {      
      Tweet.remove({}, function () {
        done();
      });
    });  
  });

  describe('createNewUser()', function () {
    it('should add a user without error', function (done) {
      User.createNewUser('user2', 'u2pw', function (err) {
        assert.equal(err, null);
        User.find( { username: 'user2' }, function (err, users) {
          assert.notEqual(null, users);
          assert.equal(1, users.length);
          var user = users[0];
          assert.equal('user2', user.username);
          assert.equal('u2pw', user.password);
          assert.strictEqual(0, user.follows.length);
          assert.strictEqual(0, user.tweets.length);
          done();
        });
      });
    });

    it('should throw when adding a user of the same username', function (done) {
      User.createNewUser('user1', 'lasdfj', function (err) {
        assert.notEqual(err, null);
        assert.equal(err.taken, true);
        done();
      });
    });
  });

  describe('findByUsername()', function () {
    it('should give null when user not found', function (done) {
      User.findByUsername('aa', function (err, user) {
        assert.equal(err, null);
        assert.equal(user, null);
        done();
      });
    });

    it('should return a user when it exists', function (done) {
      User.findByUsername('user0', function (err, user) {
        assert.equal(err, null);
        assert.equal('user0', user.username);
        assert.equal('u0pw', user.password);
        assert.strictEqual(0, user.follows.length);
        assert.strictEqual(0, user.tweets.length);
        done();
      });
    });
  });

  describe('verifyPassword()', function () {
    it('should return true for a matching password', function (done) {
      User.verifyPassword('user0', 'u0pw', function (err, match) {
        assert.equal(err, null);
        assert.equal(match, true);
        done();
      });
    });

    it('should return false for a non-matching password', function (done) {
      User.verifyPassword('user0', 'u1pw', function (err, match) {
        assert.equal(err, null);
        assert.equal(match, false);
        done();
      });
    });

    it('should return false for a non-existent user', function (done) {
      User.verifyPassword('user2', 'u2pw', function (err, match) {
        assert.equal(err, null);
        assert.equal(match, false);
        done();
      });
    });
  });

  describe('follow()', function () {
    it('should add the followee to the follows list', function (done) {
      User.follow('user0', 'user1', function (err) {
        assert.equal(err, null);
        User.findOne({ username: 'user0'}, function (er, user0) {
          User.findOne({ username: 'user1' }, function (e, user1) {
            assert.equal(user0.follows.length, 1);
            assert.deepEqual(user0.follows[0], user1._id);
            done();
          });
        });
      });
    });    

    it('should throw whe we follow someone the user is already following', function (done) {
      User.follow('user0', 'user1', function (err) {
        assert.equal(err, null);
        User.follow('user0', 'user1', function (err) {
          assert.notEqual(err, null);
          assert.equal(err.code, 2);
          done();
        });
      });
    });
  });

  describe('addTweet()', function () {
    it("should add a tweet to the user's list of tweets", function (done) {
      User.findOne({username: 'user0'}, function (err, user0) {
        Tweet.create(
          {
            content: 'aa',
            creator: user0._id
          }, function (er, tweet) {
            User.addTweet('user0', tweet._id, function (e) {
              assert.equal(e, null);
              User.findOne({username: 'user0'}, function (error, user) {
                assert.equal(error, null); 
                assert.equal(false, user.tweets.indexOf(tweet._id) < 0);
                done();
              });
            });
          }
        );        
      });
    });
  });

  describe('removeTweet()', function () {
    it("should remove a tweet to the user's list of tweets", function (done) {
      User.findOne({username: 'user0'}, function (err, user0) {
        Tweet.create(
          {
            content: 'aa',
            creator: user0._id
          }, function (er, tweet) {
            user0.tweets[0] = tweet._id;
            user0.save();
            User.removeTweet('user0', tweet._id, function (errorr) {
              assert.equal(errorr, null);
              User.findOne({username: 'user0'}, function (error3, u0) {
                assert.equal(error3, null); 
                assert.equal(true, u0.tweets.indexOf(tweet._id) < 0);
                done();
              });
            });
          }
        );        
      });
    });
  });


  describe('getFollowingTweetIds()', function () {
    it('should return an empty list because the user is not following anyone', function (done) {
      User.getFollowingTweetIds('user0', function (err, tweetIds) {
        assert.equal(err, null);
        assert.equal(0, tweetIds.length);
        done();
      });
    });

    it('should get all the ids of the tweets of everyone that the user is following', function (done) {
      User.findOne({username: 'user0'}, function (err, user0) {
        Tweet.create(
          {
            content: 'asa',
            creator: user0._id
          }, function (er, tweet) {
            User.addTweet('user0', tweet._id, function (e) {
              User.follow('user1', 'user0', function (e) {
                User.getFollowingTweetIds('user1', function (error, tweetIds) {
                  assert.equal(error, null);
                  assert.equal(1, tweetIds.length);
                  assert.deepEqual(tweetIds[0], tweet._id);
                  done();
                });
              });
            });
          }
        );        
      });
    });
  });
});


describe('Tweet', function () {

  beforeEach(function (done){ 
    User.remove({}, function () {
      User.create(
        {
          username: 'user0', 
          password: 'u0pw',
          tweets: [],
          follows: []
        }, {
          username: 'user1', 
          password: 'u1pw',
          tweets: [],
          follows: []
        }, 
        function (err) {
          Tweet.remove({}, function () {
            done();
          });
        }
      );
    });
  });

  afterEach(function (done){ 
    User.remove({}, function () {      
      Tweet.remove({}, function () {
        done();
      });
    });  
  });

  describe('addTweet()', function () {
    it('should add a tweet', function (done) {
      User.findOne({username: 'user0'}, function (err, user0) {
        Tweet.addTweet('testing', user0._id, undefined, function (er, tweet) {
          Tweet.find({content:'testing'}, function (e, t) {
            assert(t.length, 1);
            done();
          });
        });
      });
    });
  });

  describe('removeTweet()', function () {
    it('should remove a tweet', function (done) {
      User.findOne({username: 'user0'}, function (err, user0) {
        Tweet.addTweet('testing', user0._id, undefined, function (er, tweet) {
          Tweet.find({content:'testing'}, function (e, t) {
            assert(t.length, 1);
            Tweet.removeTweet(t._id, function (error) {
              Tweet.find({content:'testing'}, function (e1, t1) {
                assert(t1.length, 0);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('getTweet()', function () {
    it('should get a tweet', function (done) {
      User.findOne({username: 'user0'}, function (err, user0) {
        Tweet.addTweet('testing', user0._id, undefined, function (er, tweet) {
          Tweet.getTweet(tweet._id, function (e, t) {
            assert.deepEqual(t._id, tweet._id);
            assert.deepEqual(t.content, tweet.content);
            done();
          });
        });
      });
    });
  });

  describe('getTweets()', function () {
    it('should get all tweets with the given ids', function (done) {
      User.findOne({username: 'user0'}, function (err, user0) {
        Tweet.addTweet('testing', user0._id, undefined, function (er, tweet0) {
          Tweet.addTweet('testing2', user0._id, undefined, function (er, tweet1) {
            Tweet.getTweets('user0', function (e, ts) {
              assert.deepEqual(ts[0]._id, tweet0._id);
              assert.deepEqual(ts[0].content, tweet0.content);
              done();
            }, [tweet0._id]);
          });
        });
      });
    });
  });
});



