var mongoose = require("mongoose");

var occasionSchema = mongoose.Schema({
  title: String,
  description: String, 
  coverPhoto: String, //not sure what this is for now
  time: {type: Date, default: Date.now}, //auto timestamp
  isPublished: {type: Boolean, default: false},
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  recipients: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  thoughts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Thought'}]
});

occasionSchema.statics.createOccasion = function (occasionTitle, occasionDescription, occasionCoverPhoto, email, callback) {
  this.create(
    {
      title: occasionTitle,
      description: occasionDescription,
      coverPhoto: occasionCoverPhoto,
      creator: email,
      participants: [ ],
      recipients: [ ],
      thoughts: [ ]
    },
    function (err, occasion) {
      if (err) {
        callback(err);
      } else {
        callback(null, occasion);
      }
    });
}

occasionSchema.statics.getOccasion = function (occasionId, callback) {
  this.findOne({ '_id': occasionId }, function (err, occasion) {
    if (err) {
      callback(err);
    } else {
      callback(null, occasion);
    }
  });
}

occasionSchema.methods.addParticipant = function (email, callback) {
  this.participants.push(email);
  callback(null);
}

occasionSchema.methods.addRecepient = function (email, callback) {
  this.recepients.push(email);
  callback(null);
}

occasionSchema.methods.addThought = function (thoughtId, callback) {
  this.thoughts.push(thoughtId);
  callback(null);
}

occasionSchema.methods.publish = function (callback) {
  this.isPublished = true;
  callback(null);
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
module.exports = mongoose.model("Occasion", occasionSchema);
