var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
  email: String,
  token: String,
  fbid: String,
  name: String,
  profilePicture: String,
  createdOccasions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}],
  participatedOccasions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}],
  receivedOccasions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}]
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
          participatedOccasions: [],
          receivedOccasions: []
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

userSchema.methods.addParticipatedOccasionId = function (occasionId, callback) {
  this.participatedOccasions.push(occasionId);
  this.save();
  callback(null);
}

userSchema.methods.addReceivedOccasionId = function (occasionId, callback) {
  this.receivedOccasions.push(occasionId);
  this.save();
  callback(null);
}

userSchema.statics.removeOccasionFromAll = function (occasionId, creatorId, participantIds, recipientIds, callback) {
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
          var index = participant.participatedOccasions.indexOf(occasionId);
          if (index != -1){
             participant.participatedOccasions.splice(index, 1);
          }
          participant.save();
        });

        self.findAllById(recipientIds, function (e, recipients) {
          recipients.forEach(function (recipient) {
            var index = recipient.receivedOccasions.indexOf(occasionId);
            if (index != -1){
               recipient.receivedOccasions.splice(index, 1);
            }
            recipient.save();
          });
          
          callback(null);
        });
      });
    }
  });
}

userSchema.statics.findAllOccasions = function (userId, callback) {
  this
    .findById(userId)
    .select('name createdOccasions participatedOccasions receivedOccasions')
    .populate('createdOccasions participatedOccasions receivedOccasions')
    .exec(function (err, user) {
      if (err) {
        callback(err);
      } else {
        user.participatedOccasions = user.participatedOccasions.filter(function (occ) {
          return !occ.isPublished();
        });
        user.receivedOccasions = user.receivedOccasions.filter(function (occ) {
          return occ.isPublished();
        });
        callback(null, user)
      }
    }
  );
}


userSchema.methods.updateProfilePicture = function (newUrl, callback) {
  this.profilePicture = newUrl;
  this.save();
  callback(null);
}

module.exports = mongoose.model("User", userSchema);