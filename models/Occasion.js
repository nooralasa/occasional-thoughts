var mongoose = require("mongoose");
var User = require('./User');

var occasionSchema = mongoose.Schema({
  title: String,
  description: String, 
  coverPhoto: String, //not sure what this is for now
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  recipients: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  thoughts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Thought'}],
  publishTime: {type: Date},
  createTime: {type: Date, default: Date.now} //auto timestamp
});

occasionSchema.statics.addOccasion = function (occasionTitle, occasionDescription, occasionCoverPhoto, userId, pubTime, callback) {
  this.create(
    {
      title: occasionTitle,
      description: occasionDescription,
      coverPhoto: occasionCoverPhoto,
      creator: userId,
      participants: [ ],
      recipients: [ ],
      thoughts: [ ],
      publishTime: pubTime
    }, function (err, occasion) {
      if (err) {
        callback(err);
      } else {
        callback(null, occasion);
      }
    }
  );
}

occasionSchema.statics.createOccasion = function (occasionTitle, occasionDescription, occasionCoverPhoto, participants, userId, pubTime, callback) {
  var self = this;

  // check if user id is valid
  User.findById(userId, function (err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      callback({code: 404, msg: 'Invalid user'});
    } else {
      // then create event
      self.addOccasion(occasionTitle, occasionDescription, occasionCoverPhoto, user._id, pubTime, function (er, occasion) {
        if (er) {
          callback(er);
        } else {
          // then find ids of friends
          User.findAllByFbid(participants, function (error, friends) {
            if (error) {
              callback(error);
            } else {
              // then add these ids to the participant list
              var friendIds = friends.map(function (friend) {
                return friend._id;
              });
              occasion.addParticipants(friendIds, function (error1) {
                if (error1) {
                  callback(error1);
                } else {
                  // then add that occasion to the user's created list
                  user.addCreatedOccasionId(occasion._id, function (e) {
                    if (e) {
                      callback(e)
                    } else {

                      //angus send email
                      // finally reply ok
                      callback(null);
                    }
                  });
                }
              });
            }
          });          
        }
      });
    }
  });
}

occasionSchema.statics.populateOccasion = function (occasionId, callback) {
  this
    .findById(occasionId)
    .populate({
      path: 'thoughts',     
      populate: { path: 'creator', model: User }
    })
    .populate('participants')
    .exec(function (err, occasion) {
      if (err) {
        callback(err);
      } else if (occasion) {
        callback(null, occasion);
      } else {
        callback({code: 404, msg: 'Resource not found.'});
      }
    }
  );
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

occasionSchema.statics.removeOccasion = function (occasionId, callback) {
  var self = this;
  self.getOccasion(occasionId, function (err, occasion) {
    if (err) {
      callback(err);
    } else {
      User.removeOccasionFromAll(occasion._id, occasion.creator, occasion.participants, function (er) {
        if (er) {
          callback(er);
        } else {
          // soft delete 
          callback(null);
          // self.remove({ '_id': occasionId }, function (e) {
          //   if (e) {
          //     callback(e);
          //   } else {
          //     callback(null);
          //   }
          // });
        }
      })
    }
  });
}

occasionSchema.statics.editOccasion = function (occasionId, occasionTitle, occasionDescription, occasionCoverPhoto, removeParticipants, newParticipants, removeRecipients, newRecipients, callback) {
  var self = this;
  self.getOccasion(occasionId, function (err, occasion) {
    if (err) {
      callback(err);
    } else {
      occasion.editOccasionDetails(occasionTitle, occasionDescription, occasionCoverPhoto, function (er) {
        if (er) {
          callback(er);
        } else {
          occasion.removeParticipants(removeParticipants, function (e) {
            if (e) {
              callback(e);
            } else {
              occasion.addParticipants(newParticipants, function (error) {
                if (error) {
                  callback(error);
                } else {
                  occasion.removeRecipients(removeRecipients, function (error1) {
                    if (error1) {
                      callback(error1);
                    } else {
                      occasion.addRecipients(newRecipients, function (error2) {
                        if (error2) {
                          callback(error2);
                        } else {
                          callback(null);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });

    }
  });
}

occasionSchema.methods.editOccasionDetails = function (occasionTitle, occasionDescription, occasionCoverPhoto, callback) {
  this.title = occasionTitle;
  this.description = occasionDescription;
  this.coverPhoto = occasionDescription;
  this.save();
  callback(null);
}

// add people
occasionSchema.methods.addParticipant = function (userId, callback) {
  this.participants.push(userId);
  this.save();
  callback(null);
}

occasionSchema.methods.addParticipants = function (userIds, callback) {
  var self = this;
  userIds.forEach(function (userId) {
    self.participants.push(userId);
  });
  self.save();
  callback(null);
}

occasionSchema.methods.removeAllParticipants = function (callback) {
  var self = this;
  self.participants = [];
  self.save();
  callback(null);
}

occasionSchema.methods.removeParticipants = function (userIds, callback) {
  var self = this;
  self.participants = self.participants.filter(function (userId, index, arr) {
    return arr.indexOf(userId) >= 0;
  });
  self.save();
  callback(null);
}

occasionSchema.methods.addRecipient = function (userId, callback) {
  this.recipients.push(userId);
  this.save();
  callback(null);
}

occasionSchema.methods.addRecipients = function (userIds, callback) {
  var self = this;
  userIds.forEach(function (userId) {
    self.recipients.push(userId);
  });
  self.save();
  callback(null);
}

occasionSchema.methods.removeRecipients = function (userIds, callback) {
  var self = this;
  self.recipients = self.recipients.filter(function (userId, index, arr) {
    return arr.indexOf(userId) >= 0;
  });
  self.save();
  callback(null);
}

occasionSchema.methods.removeAllRecipients = function (callback) {
  var self = this;
  self.recipients = [];
  self.save();
  callback(null);
}


// checks if is authorized to view
occasionSchema.methods.isParticipant = function (userId, callback) {
  var self = this;
  var strs = self.participants.map(function (id) {
    return id.toString();
  });
  callback(null, strs.indexOf(userId.toString()) >= 0);
}

occasionSchema.methods.isRecipient = function (userId, callback) {
  var self = this;
  var strs = self.recipients.map(function (id) {
    return id.toString();
  });
  callback(null, strs.indexOf(userId.toString()) >= 0);
}

occasionSchema.methods.isCreator = function (userId, callback) {
  var self = this;
  callback(null, self.creator.equals(userId));
}

occasionSchema.methods.isParticipantOrCreator = function (userId, callback) {
  var self = this;
  self.isParticipant(userId, function (err, isParticipant) {
    if (isParticipant) {
      callback(null, true);
    } else {
      self.isCreator(userId, function (er, isCreator) {
        callback(null, isCreator);
      });
    }
  });
}

occasionSchema.methods.canView = function (userId, callback) {
  var self = this;
  self.isParticipant(userId, function (isParticipant) {
    if (isParticipant) {
      callback(null, true);
    } else {
      self.isRecipient(userId, function (isRecipient) {
        if (isRecipient) {
          callback(null, true);
        } else {
          self.isCreator(userId, function (isCreator) {
            callback(null, isCreator);
          });
        }
      });
    }
  });
}



// add thought
occasionSchema.methods.addThought = function (thoughtId, callback) {
  if (this.isPublished()) {
    callback({code: 403, msg: "Occassion already published."})
  } else {
    this.thoughts.push(thoughtId);
    this.save();
    callback(null);
  }
}

occasionSchema.methods.removeThought = function (thoughtId, callback) {
  if (this.isPublished()) {
    callback({code: 403, msg: "Occassion already published."})
  } else {
    var i = this.thoughts.indexOf(thoughtId);
    if (i != -1){
       this.thoughts.splice(i, 1);
    }
    this.save();
    callback(null);
  }
}

occasionSchema.methods.isPublished = function (callback) {
  return Date.now() > this.publishTime;
}

// When we 'require' this model in another file (e.g. routes),
// we specify what we are importing form this file via module.exports.
// Here, we are 'exporting' the mongoose model object created from
// the specified schema.
module.exports = mongoose.model("Occasion", occasionSchema);
