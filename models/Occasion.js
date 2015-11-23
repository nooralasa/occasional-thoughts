var mongoose = require("mongoose");

var occasionSchema = mongoose.Schema({
  title: String,
  description: String, 
  coverPhoto: String, //not sure what this is for now
  isPublished: Boolean,
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  recipients: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  thoughts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Thought'}],
  time: {type: Date, default: Date.now} //auto timestamp
});

occasionSchema.statics.createOccasion = function (occasionTitle, occasionDescription, occasionCoverPhoto, userId, callback) {
  this.create(
    {
      title: occasionTitle,
      description: occasionDescription,
      coverPhoto: occasionCoverPhoto,
      isPublished: false,
      creator: userId,
      participants: [ ],
      recipients: [ ],
      thoughts: [ ]
    }, function (err, occasion) {
      if (err) {
        callback(err);
      } else {
        callback(null, occasion);
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
  this.thoughts.push(thoughtId);
  this.save();
  callback(null);
}

occasionSchema.methods.publish = function (callback) {
  this.isPublished = true;
  this.save();
  callback(null);
}

// When we 'require' this model in another file (e.g. routes),
// we specify what we are importing form this file via module.exports.
// Here, we are 'exporting' the mongoose model object created from
// the specified schema.
module.exports = mongoose.model("Occasion", occasionSchema);
