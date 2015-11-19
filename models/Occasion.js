var mongoose = require("mongoose");

var occasionSchema = mongoose.Schema({
  title: String,
  description: String, 
  coverPhoto: String, //not sure what this is for now
  time: {type: Date, default: Date.now}, //auto timestamp
  isPublished: Boolean,
  creator: String,//{type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  recipients: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  thoughts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Thought'}]
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
    },
    function (err, occasion) {
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

occasionSchema.methods.addParticipant = function (userId, callback) {
  this.participants.push(userId);
  this.save();
  callback(null);
}

occasionSchema.methods.addRecipient = function (userId, callback) {
  this.recipients.push(userId);
  this.save();
  callback(null);
}

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
