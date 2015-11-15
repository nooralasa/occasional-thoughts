var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  follows: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  tweets: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tweet'}]
});

userSchema.statics.createNewUser = function (username, password, callback) {
  var self = this;
  self.findOne({ 'username': username }, function (err, user) {
    if (err) {
      callback(err);
    } else if (user) {
      callback({ 'taken': true });
    } else {
      self.create(
        { 
          username: username, 
          password: password, 
          follows: [],
          tweets: []
        }, 
        function (er, record) {
          if (er) {
            callback(er);
          } else {
            callback(null);
          }
        }
      );
    }
  });
}

userSchema.statics.findByUsername = function (username, callback) {
  this.findOne({ 'username': username}, function (err, user) {
    if (err) {
      callback(err);
    } else {
      callback(null, user);
    }
  });
}

userSchema.statics.verifyPassword = function (username, candidatepw, callback) {
  this.findByUsername(username, function (err, user) {
    if (err) {
      callback(err);
    } else if (user) {
      if (candidatepw === user.password) {
        callback(null, true); 
      } else {
        callback(null, false);
      }
    } else {
      callback(null, false);
    }
  });
}

userSchema.statics.follow = function (username, followeeName, callback) {
  var self = this
  self.findByUsername(username, function (err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      callback({ msg : 'Invalid follower', code: 1 });
    } else {
      self.findByUsername(followeeName, function (er, followee) {
        if (er) {
          callback(er);
        } else if (!followee) {
          callback({ msg : 'Invalid followee', code: 1});
        } else {
          if (user.follows.indexOf(followee._id) < 0) {
            user.follows.push(followee._id);
            user.save();
            callback(null);
          } else {
            callback({ msg: 'User already in following list!', code: 2})
          }
        }
      });
    }
  });
}

userSchema.statics.getFollowingTweetIds = function (username, callback) {
  var self = this;
  self.findByUsername(username, function (err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      callback({ msg : 'Invalid user' });
    } else {
      self.find()
        .where('_id').in(user.follows)
        .select('tweets username')
        .exec(function (er, followees) {
          if (er) {
            callback(er);
          } else {
            var tweetIds = []
            followees.forEach(function (followee) {
              tweetIds = tweetIds.concat(followee.tweets);
            });
            callback(null, tweetIds);
          }
        }
      );
    }
  });
}

userSchema.statics.removeTweet = function (username, tweetId, callback) {
  var self = this;
  self.findByUsername(username, function (err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      callback({ msg : 'Invalid user' });
    } else {
      user.tweets.remove(tweetId);
      user.save();
      callback(null);
    }
  });
}

userSchema.statics.addTweet = function (username, tweetId, callback) {
  var self = this;
  self.findByUsername(username, function (err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      callback({ msg : 'Invalid user' });
    } else {
      user.tweets.push(tweetId);
      user.save();
      callback(null);
    }
  });
}

module.exports = mongoose.model("User", userSchema);