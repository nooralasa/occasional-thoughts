var mongoose = require("mongoose");

var thoughtSchema = mongoose.Schema({
  creator: String,
  message: String, 
  photo: String, //not sure what to do for now
  time: {type: Date, default: Date.now}, //auto timestamp
  isPublic: Boolean
});

thoughtSchema.statics.createThought = function (email, content, picture, privacySetting, callback) {
  this.create(
    {
      creator: email,
      message: content,
      photo: picture,
      isPublic: privacySetting
    },
    function (err, thought) {
      if (err) {
        callback(err);
      } else {
        callback(null, thought);
      }
    });
}

thoughtSchema.statics.getThought = function (thoughtId, callback) {
  this.findOne({ '_id': thoughtId }, function (err, thought) {
    if (err) {
      callback(err);
    } else {
      callback(null, thought);
    }
  });
}

/*
tweetSchema.statics.addTweet = function (tweetContent, userId, retweetedFrom, callback) {
  this.create(
    { 
      content: tweetContent, 
      creator: userId,
      retweet: retweetedFrom
    }, 
    function (err, tweet) {
      if (err) {
        callback(err);
      } else {
        callback(null, tweet);
      }
    }
  );
}

tweetSchema.statics.removeTweet = function (tweetId, callback) {
  this.remove({ '_id': tweetId }, function (e) {
    if (e) {
      callback(e);
    } else {
      callback(null);
    }
  });
}

tweetSchema.statics.getTweet = function (tweetId, callback) {
  this.findOne({ '_id': tweetId }, function (err, tweet) {
    if (err) {
      callback(err);
    } else {
      callback(null, tweet);
    }
  });
}

tweetSchema.statics.getTweets = function (username, callback, idList) {
  var query = this.find();
  if (idList) {
    query = query.where('_id').in(idList);
  }
  query.populate('creator')
    .populate('retweet')
    .exec(function (er, tweets){
      if (er) {
        callback(er);
      } else {
        tweetItems = tweets.map(function (tweet) {
          return {
            _id: tweet._id,
            content: tweet.content,
            creatorId: tweet.creator._id,
            creator: tweet.creator.username,
            retweet: tweet.retweet ? tweet.retweet.username : undefined,
            userIsCreator: username === tweet.creator.username,
            time: tweet.time,
            timeString: tweet.time.toLocaleString()
          };
        });
        callback(null, tweetItems.sort(function (a, b) {
          return b.time - a.time;
        }));
      }
    });
}
*/
// When we 'require' this model in another file (e.g. routes),
// we specify what we are importing form this file via module.exports.
// Here, we are 'exporting' the mongoose model object created from
// the specified schema.
module.exports = mongoose.model("Thought", thoughtSchema);
