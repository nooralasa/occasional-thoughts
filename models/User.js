var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
  email: String,
  token: String,
  fbid: String,
  name: String,
  profilePicture: String,
  createdOccasions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}],
  viewableOccasions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}]
});

userSchema.statics.createNewUser = function (email, token, fbid, name, profilePicture, callback) {
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
          token: token, 
          fbid: fbid,
          name: name,
          profilePicture: profilePicture,
          createdOccasions: [],
          viewableOccasions: []
        }, 
        function (er, newUser) {
          if (er) {
            callback(er);
          } else {
            callback(null, newUser);
          }
        }
      );
    }
  });
}

userSchema.statics.findByEmail = function (email, callback) {
  this.findOne({ 'email': email }, function (err, user) {
    if (err) {
      callback(err);
    } else {
      callback(null, user);
    }
  });
}

userSchema.statics.findByFbid = function (fbid, callback) {
  this.findOne({ 'fbid': fbid }, function (err, user) {
    if (err) {
      callback(err);
    } else {
      callback(null, user);
    }
  });
}

userSchema.statics.findAllByFbid = function (fbids, callback) {
  this.find({ 'fbid': { $in: fbids} }, function (err, users) {
    if (err) {
      callback(err);
    } else {
      callback(null, users);
    }
  });
}

userSchema.statics.findAllByEmail = function (emails, callback) {
  this.find({ 'email': { $in: emails} }, function (err, users) {
    if (err) {
      callback(err);
    } else {
      callback(null, users);
    }
  });
}

userSchema.statics.findAllById = function (ids, callback) {
  this.find({ '_id': { $in: ids} }, function (err, users) {
    if (err) {
      callback(err);
    } else {
      callback(null, users);
    }
  });
}

userSchema.methods.addCreatedOccasionId = function (occasionId, callback) {
  var self = this;
  self.createdOccasions.push(occasionId);
  self.save();
  callback(null);
}

userSchema.methods.addViewableOccasionId = function (occasionId, callback) {
  this.viewableOccasions.push(occasionId);
  this.save();
  callback(null);
}

userSchema.statics.removeOccasionFromAll = function (occasionId, creatorId, participantIds, callback) {
  var self = this;

  self.findById(creatorId, function (err, creator) {
    if (err) {
      callback(err);
    } else {
      var i = creator.createdOccasions.indexOf(occasionId);
      if (i != -1){
         creator.createdOccasions.splice(i, 1);
      }
      creator.save();

      self.findAllById(participantIds, function (er, participants) {
        participants.forEach(function (participant) {
          var index = participant.createdOccasions.indexOf(occasionId);
          if (index != -1){
             creator.viewableOccasions.splice(index, 1);
          }
          participant.save();
        });
        callback(null);
      });
    }
  });
}

userSchema.statics.findAllOccasions = function (userId, callback) {
  this
    .findById(userId)
    .select('name createdOccasions viewableOccasions')
    .populate('createdOccasions viewableOccasions')
    .exec(function (err, user) {
      if (err) {
        callback(err);
      } else {
        callback(null, user)
        /*angus*/
        // render ejs
        // utils.sendSuccessResponse(res, { user: user });
      }
    }
  );
}


userSchema.methods.updateProfilePicture = function (newUrl, callback) {
  this.profilePicture = newUrl;
  this.save();
  callback(null);
}

// userSchema.methods.getCreatedOccasionIds = function (callback) {
//   callback(null, this.createdOccasion);
// }

// userSchema.methods.getViewableOccasionIds = function (callback) {
//   callback(null, this.viewableOccasion);
// }

module.exports = mongoose.model("User", userSchema);