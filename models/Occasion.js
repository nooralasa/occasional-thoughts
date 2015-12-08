var mongoose = require("mongoose");
var User = require('./User');

//The following three variables are used for scheduling emails
var email_client = require('../utils/email_client');
var schedule = require('node-schedule');
var baselink = 'http://occasionalthoughts.herokuapp.com';

//This is how an occasion is represented in our database. 
var occasionSchema = mongoose.Schema({
  title: String, //the title of the occasion
  description: String, //the description of the event
  coverPhoto: String,  //the cover photo passed in as a url
  // The creator, participants and recipients of an occasion are invariant.
  // They don't change after an occasion is created
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  recipients: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  //These two booleans allow the implementation of public links
  participantIsPublic: Boolean,
  recipientIsPublic: Boolean,
  //Thoughts are populated by participants and the creator only
  thoughts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Thought'}],
  //The occasion will be automatically published at the publishTime 
  publishTime: {type: Date},
  createTime: {type: Date, default: Date.now} //auto timestamp
});

/**
 * creates the occasion within the schema
 *
 * @constructor
 * @param {String} occasionTitle the title of the occasion 
 * @param {String} occasionDescription the description of the occasion
 * @param {String} occasionCoverPhoto the url to the cover photo of the occasion
 * @param {String} userId the id of the (current) user who created the occasion
 * @param {String} pubTime the UTC datetime that the occasion was created at
 * @param {Boolean} participantIsPublic an indicator suggesting that the occasion is public before publishing
 * @param {Boolean} recipientIsPublic an indicator suggesting that the occasion is public after publishing
 * @param {function} callback a function to be called at the end of the query
 *
 */
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
        callback(null, occasion);
      }
    }
  );
}

/**
 * adds the occasion to the database and handels all the necessary steps to successfully setup the occasion entry
 *
 * @param {String} occasionTitle the title of the occasion 
 * @param {String} occasionDescription the description of the occasion
 * @param {String} occasionCoverPhoto the url to the cover photo of the occasion
 * @param {Array} participants list of String userIds of the participants of this occasion
 * @param {Array} recipients list of String userIds of the recipients of this occasion
 * @param {Boolean} participantIsPublic an indicator suggesting that the occasion is public before publishing
 * @param {Boolean} recipientIsPublic an indicator suggesting that the occasion is public after publishing
 * @param {String} userId the id of the (current) user who created the occasion
 * @param {String} pubTime the UTC datetime that the occasion was created at
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.statics.addOccasionEntry = function (occasionTitle, occasionDescription, occasionCoverPhoto, participants, recipients, participantIsPublic, recipientIsPublic, userId, pubTime, callback) {
  var self = this;

  // check if user id is valid
  User.findById(userId, function (err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      callback({code: 404, msg: 'Invalid user'});
    } else {
      // then create occasion
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
                        friend.addReceivedOccasionId(occasion._id, function (error5) {
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
                                  schedule.scheduleJob(newDate, function () {
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

/**
 * returns all the thoughts that the current user can view
 *
 * @param {String} occasionId the id of the occasion in concern
 * @param {String} userId the id of the user viewing the occasion
 * @param {function} callback a function to be called at the end of the query
 *
 */
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
          occasion.thoughts = occasion.thoughts.filter(function (thought) {
            return thought.creator.equals(userId);
          });
        }
        callback(null, occasion);
      } else {
        callback({code: 404, msg: 'Resource not found.'});
      }
    }
  );
}

/**
 * returns the relevant occasion by querying its id
 *
 * @param {String} occasionId the id of the occasion in concern
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.statics.getOccasion = function (occasionId, callback) {
  this.findOne({ '_id': occasionId }, function (err, occasion) {
    if (err) {
      callback(err);
    } else {
      callback(null, occasion);
    }
  });
}

/**
 * soft delete of the identified occasion
 *
 * @param {String} occasionId the id of the occasion in concern
 * @param {function} callback a function to be called at the end of the query
 *
 */
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
        }
      })
    }
  });
}

/**
 * edits the occasion of concern
 *
 * @param {String} occasionId the id of the occasion in concern
 * @param {String} occasionTitle the updated title of the occasion 
 * @param {String} occasionDescription the updated description of the occasion
 * @param {String} occasionCoverPhoto the updated url to the cover photo of the occasion
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.statics.editOccasion = function (occasionId, occasionTitle, occasionDescription, occasionCoverPhoto, callback) {
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
        }
      });

    }
  });
}

/**
 * edits the occasion of concern
 *
 * @param {String} occasionTitle the updated title of the occasion 
 * @param {String} occasionDescription the updated description of the occasion
 * @param {String} occasionCoverPhoto the updated url to the cover photo of the occasion
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.methods.editOccasionDetails = function (occasionTitle, occasionDescription, occasionCoverPhoto, callback) {
  this.title = occasionTitle;
  this.description = occasionDescription;
  this.coverPhoto = occasionCoverPhoto;
  this.save();
  callback(null);
}

/**
 * adds a list of users as participants to an occasion
 *
 * @param {Array} userIds a list of user ids for the participants to be added
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.methods.addParticipants = function (userIds, callback) {
  var self = this;
  userIds.forEach(function (userId) {
    self.participants.push(userId);
  });
  self.save();
  callback(null);
}

/**
 * adds a list of users as recipients to an occasion
 *
 * @param {Array} userIds a list of user ids for the recipients to be added
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.methods.addRecipients = function (userIds, callback) {
  var self = this;
  userIds.forEach(function (userId) {
    self.recipients.push(userId);
  });
  self.save();
  callback(null);
}

/**
 * returns true if the user is a participant of this occasion
 *
 * @param {String} userId the id of the user viewing the occasion
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.methods.isParticipant = function (userId, callback) {
  var self = this;

  var strs = self.participants.filter(function (participant) {
    return participant._id.equals(userId);
  });
  callback(null, strs.length >= 1);
}

/**
 * returns true if the user is a recipient of this occasion
 *
 * @param {String} userId the id of the user viewing the occasion
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.methods.isRecipient = function (userId, callback) {
  var self = this;
  var strs = self.recipients.filter(function (id) {
    return id.equals(userId);
  });
  callback(null, strs.length >= 1);
}

/**
 * returns true if the user is the creator of the occasion
 *
 * @param {String} userId the id of the user viewing the occasion
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.methods.isCreator = function (userId, callback) {
  var self = this;
  callback(null, self.creator.equals(userId));
}

/**
 * returns true if the user is a creator of or a prticipant in this occasion
 *
 * @param {String} userId the id of the user viewing the occasion
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.methods.isParticipantOrCreator = function (userId, callback) {
  var self = this;
  self.isParticipant(userId, function (err, isParticipant) {
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

/**
 * returns true if the user has permission to view the occasion
 * this method checks whether the occasion is public or not pre 
 * and post publishing and assgins permissions accordingly
 *
 * @param {String} userId the id of the user viewing the occasion
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.methods.canView = function (userId, callback) {
  var self = this;

  self.isCreator(userId, function (err, isCreator) {
    if (isCreator) {
      callback(null, true);
    } else {
      if (self.isPublished()) {
        if (self.recipientIsPublic) {
          callback(null, true);
        } else {
          self.isRecipient(userId, function (er, isRecipient) {
            callback(null, isRecipient);
          });
        }
      } else {
        if (self.participantIsPublic) {
          callback(null, true);
        } else {
          self.isParticipant(userId, function (er, isParticipant) {
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



/**
 * adds a thought to the occasion's list of thoughts
 *
 * @param {String} thoughtId the id of the thought to be added 
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.methods.addThought = function (thoughtId, callback) {
  if (this.isPublished()) {
    callback({code: 403, msg: "Occasion already published."})
  } else {
    this.thoughts.push(thoughtId);
    this.save();
    callback(null);
  }
}

/**
 * soft deletes a thought from an occasion's list of thoughts
 *
 * @param {String} thoughtId the id of the thought to be added 
 * @param {function} callback a function to be called at the end of the query
 *
 */
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

/**
 * returns true if the occasion is published
 *
 * @param {function} callback a function to be called at the end of the query
 *
 */
occasionSchema.methods.isPublished = function (callback) {
  return Date.now() > this.publishTime;
}

// Exporting the mongoose object to be used elsewhere in the code
module.exports = mongoose.model("Occasion", occasionSchema);
