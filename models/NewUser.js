var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  createdOccasions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}],
  viewableOccasions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}]
});

userSchema.statics.createNewUser = function (email, password, firstName, lastName, callback) {
  var self = this;
  self.findOne({ 'email': email }, function (err, user) {
    if (err) {
      callback(err);
    } else if (user) {
      callback({ 'taken': true });
    } else {
      self.create(
        { 
          email: email, 
          password: password, 
          firstName: firstName,
          lastName: lastName,
          createdOccasions: [],
          viewableOccasions: []
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

userSchema.statics.findByEmail = function (email, callback) {
  this.findOne({ 'email': email}, function (err, user) {
    if (err) {
      callback(err);
    } else {
      callback(null, user);
    }
  });
}

userSchema.statics.verifyPassword = function (email, candidatepw, callback) {
  this.findByEmail(email, function (err, user) {
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

userSchema.methods.addCreatedOccasionId = function (occasionId, callback) {
  this.createdOccasions.push(occasionId);
  this.save();
  callback(null);
}

userSchema.methods.addViewableOccasionId = function (occasionId, callback) {
  this.viewableOccasions.push(occasionId);
  this.save();
  callback(null);
}

userSchema.methods.getCreatedOccasionIds = function (callback) {
  callback(null, this.addCreatedOccasion);
}

userSchema.methods.getViewableOccasionIds = function (callback) {
  callback(null, this.addViewableOccasion);
}

/*
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
*/
module.exports = mongoose.model("User", userSchema);