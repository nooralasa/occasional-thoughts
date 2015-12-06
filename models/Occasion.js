var mongoose = require("mongoose");
var User = require('./User');
var email_client = require('../utils/email_client');
var schedule = require('node-schedule');
var baselink = 'http://localhost:3000';

var occasionSchema = mongoose.Schema({
  title: String,
  description: String, 
  coverPhoto: String, //not sure what this is for now
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  recipients: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  participantIsPublic: Boolean,
  recipientIsPublic: Boolean,
  thoughts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Thought'}],
  publishTime: {type: Date},
  createTime: {type: Date, default: Date.now} //auto timestamp
});

occasionSchema.statics.addOccasion = function (occasionTitle, occasionDescription, occasionCoverPhoto, userId, pubTime, participantIsPublic, recipientIsPublic, callback) {
  this.create(
    {
      title: occasionTitle,
      description: occasionDescription,
      coverPhoto: occasionCoverPhoto,
      creator: userId,
      participants: [ ],
      recipients: [ ],
      participantIsPublic: participantIsPublic,
      recipientIsPublic: recipientIsPublic,
      thoughts: [ ],
      publishTime: pubTime
    }, function (err, occasion) {
      if (err) {
        callback(err);
      } else {
        console.log(occasion);
        callback(null, occasion);
      }
    }
  );
}

occasionSchema.statics.createOccasion = function (occasionTitle, occasionDescription, occasionCoverPhoto, participants, recipients, participantIsPublic, recipientIsPublic, userId, pubTime, callback) {
  var self = this;

  console.log("Recipients are: "+recipients);

  // check if user id is valid
  User.findById(userId, function (err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      callback({code: 404, msg: 'Invalid user'});
    } else {
      // then create event
      self.addOccasion(occasionTitle, occasionDescription, occasionCoverPhoto, user._id, pubTime, participantIsPublic, recipientIsPublic, function (er, occasion) {
        if (er) {
          callback(er);
        } else {
          // then find ids of participants
          User.findAllByFbid(participants, function (error, participantFriends) {
            if (error) {
              callback(error);
            } else {
              //then add that occasion to each participant's participated list
              participantFriends.forEach(function (friend) {
                friend.addParticipatedOccasionId(occasion._id, function (error4) {
                  if (error4) {
                    console.log(error4);
                  }
                });
              });
              // then add these ids to the participant list
              var participantFriendIds = participantFriends.map(function (friend) {
                return friend._id;
              });
              occasion.addParticipants(participantFriendIds, function (error1) {
                if (error1) {
                  callback(error1);
                } else {

                  // then find ids of recipients
                  User.findAllByFbid(recipients, function (error0, recipientFriends) {
                    if (error0) {
                      callback(error0);
                    } else {
                      //then add that occasion to each recipient's received list
                      recipientFriends.forEach(function (friend) {
                        friend.addParticipatedOccasionId(occasion._id, function (error5) {
                          if (error5) {
                            console.log(error5);
                          }
                        });
                      }); 
                      // then add these ids to the recipients list
                      var recipientFriendIds = recipientFriends.map(function (friend) {
                        return friend._id;
                      });
                      occasion.addRecipients(recipientFriendIds, function (error2) {
                        if (error2) {
                          callback(error2);
                        } else {
                          // then add that occasion to the user's created list
                          user.addCreatedOccasionId(occasion._id, function (e) {
                            if (e) {
                              callback(e)
                            } else {
                              // then send the emails
                              var invitationEmails = participantFriends.map(function (friend) {
                                return friend.email;
                              });
                              email_client.sendInvitationEmails(user.name, user.email, baselink+"/occasions/"+occasion._id, invitationEmails, function (err1, result) {
                                if (err1) {
                                  callback(err1);
                                } else {
                                  // then schedule to send email at pubDate
                                  var newDate = new Date(pubTime);
                                  console.log("pubTime: ",pubTime);
                                  console.log(typeof newDate);
                                  schedule.scheduleJob(newDate, function () {
                                    console.log("in scheduled job");
                                    self
                                      .findById(occasion._id)
                                      .populate('recipients')
                                      .exec(function (error3, updatedOccasion) {
                                        if (error3) {
                                          console.log(error3);
                                        } else {
                                          var recipientEmails = updatedOccasion.recipients.map(function (recp) {
                                            return recp.email;
                                          });
                                          email_client.sendPublishEmails(user.name, user.email, baselink+"/occasions/"+occasion._id, [user.email].concat(recipientEmails), function (err2, result) {
                                            console.log('email sent');
                                            console.log(err2);
                                            console.log(result);
                                          });
                                        }
                                      }
                                    );
                                  });
                                  //then send back ok
                                  callback(null);
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  }); // End of User.Find          
                }
              });
            }
          });
        }
      });
    }
  });
}

occasionSchema.statics.populateOccasion = function (occasionId, userId, callback) {
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
        // filter only when not published, not public, and is participant
        if (!occasion.isPublished() && !occasion.participantIsPublic && !occasion.creator.equals(userId)) {
          console.log('filtering thoughts');
          occasion.thoughts = occasion.thoughts.filter(function (thought) {
            return thought.creator.equals(userId);
          });
        }
        console.log(occasion);
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
      User.removeOccasionFromAll(occasion._id, occasion.creator, occasion.participants, occasion.recipients, function (er) {
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
          callback(null);

          // occasion.removeParticipants(removeParticipants, function (e) {
          //   if (e) {
          //     callback(e);
          //   } else {
          //     occasion.addParticipants(newParticipants, function (error) {
          //       if (error) {
          //         callback(error);
          //       } else {
          //         occasion.removeRecipients(removeRecipients, function (error1) {
          //           if (error1) {
          //             callback(error1);
          //           } else {
          //             occasion.addRecipients(newRecipients, function (error2) {
          //               if (error2) {
          //                 callback(error2);
          //               } else {
          //                 callback(null);
          //               }
          //             });
          //           }
          //         });
          //       }
          //     });
          //   }
          // });
        }
      });

    }
  });
}

occasionSchema.methods.editOccasionDetails = function (occasionTitle, occasionDescription, occasionCoverPhoto, callback) {
  this.title = occasionTitle;
  this.description = occasionDescription;
  this.coverPhoto = occasionCoverPhoto;
  this.save();
  callback(null);
}

// add people
occasionSchema.methods.addParticipant = function (userId, callback) {
  this.participants.push(userId);
  this.save();
  console.log(this.participants);
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
  // console.log('userId: ',userId);
  // console.log('participants: ',self.participants);
  var strs = self.participants.filter(function (id) {
    console.log('id: ',id._id);
    return id._id.equals(userId);
  });
  callback(null, strs.length >= 1);
}

occasionSchema.methods.isRecipient = function (userId, callback) {
  var self = this;
  console.log('userId: ',userId);
  console.log('recipients: ',self.recipients);
  var strs = self.recipients.filter(function (id) {
    console.log('id: ',id);
    return id.equals(userId);
  });
  callback(null, strs.length >= 1);
}

occasionSchema.methods.isCreator = function (userId, callback) {
  var self = this;
  callback(null, self.creator.equals(userId));
}

occasionSchema.methods.isParticipantOrCreator = function (userId, callback) {
  var self = this;
  self.isParticipant(userId, function (err, isParticipant) {
    console.log(isParticipant);
    if (isParticipant) {
      callback(null, true);
    } else {
      self.isRecipient(userId, function (errr, isRecipient) {
        if (isRecipient) {
          callback(null, true);
        } else {
          self.isCreator(userId, function (er, isCreator) {
            callback(null, isCreator);
          });
        }
      });
    }
  });
}

occasionSchema.methods.canView = function (userId, callback) {
  var self = this;

  self.isCreator(userId, function (err, isCreator) {
    if (isCreator) {
      callback(null, true);
    } else {
      if (self.isPublished()) {
        console.log('ispublished');
        if (self.recipientIsPublic) {
          callback(null, true);
        } else {
          self.isRecipient(userId, function (er, isRecipient) {
            callback(null, isRecipient);
          });
        }
      } else {
        console.log('notpublished');
        if (self.participantIsPublic) {
          callback(null, true);
        } else {
          self.isParticipant(userId, function (er, isParticipant) {
            console.log('isparticipant ' + isParticipant);
            callback(null, isParticipant);
          });
        }
      }
    }
  });

  self.isParticipant(userId, function (err, isParticipant) {
    if (isParticipant) {
      callback(null, true);
    } else {
      self.isRecipient(userId, function (errr, isRecipient) {
        if (isRecipient) {
          callback(null, true);
        } else {
        }
      });
    }
  });
}



// add thought
occasionSchema.methods.addThought = function (thoughtId, callback) {
  if (this.isPublished()) {
    callback({code: 403, msg: "Occasion already published."})
  } else {
    this.thoughts.push(thoughtId);
    this.save();
    callback(null);
  }
}

occasionSchema.methods.removeThought = function (thoughtId, callback) {
  if (this.isPublished()) {
    callback({code: 403, msg: "Occasion already published."})
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
