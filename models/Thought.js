var mongoose = require("mongoose");
var User = require('./User');
var Occasion = require('./Occasion');

var thoughtSchema = mongoose.Schema({
  message: String, 
  photo: String, //not sure what to do for now
  isPublic: Boolean,
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  occasion: {type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'},
  time: {type: Date, default: Date.now} //auto timestamp
});

thoughtSchema.statics.addThought = function (message, photo, isPublic, occasionId, userId, callback) {
  this.create(
    {
      message: message,
      photo: photo,
      isPublic: isPublic,
      creator: userId,
      occasion: occasionId
    }, function (err, thought) {
      if (err) {
        callback(err);
      } else {
        callback(null, thought);
      }
    }
  );
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

thoughtSchema.statics.removeThought = function (thoughtId, occasionId, callback) {
  var self = this;
  self.getThought(thoughtId, function (err, thought) {
    if (err) {
      callback(err);
    } else {
      Occasion.findById(occasionId, function (er, occasion) {
        if (er) {
          callback(er);
        } else {
          occasion.removeThought(thought._id, function (e) {
            if (e) {
              callback(e);
            } else {
              // soft delete
              callback(null);
              // self.remove({ '_id': thoughtId }, function (error) {
              //   if (error) {
              //     callback(error);
              //   } else {
              //     callback(null);
              //   }
              // });
            }
          });
        }
      });
    }
  });
}

thoughtSchema.statics.editThought = function (thoughtId, newMessage, newPhoto, newIsPublic, callback) {
  var self = this;
  self
    .findById(thoughtId)
    .populate('occasion')
    .exec(function (err, thought) {
      if (err) {
        callback(err);
      } else if (thought.occasion.isPublished()) {
        callback({ code: 403, msg: 'Occasion already published' });
      } else {
        thought.message = newMessage;
        thought.photo = newPhoto;
        thought.isPublic = newIsPublic;
        thought.save();
        callback(null);
      }
    }
  );
}

thoughtSchema.statics.createThought = function (thoughtMessage, thoughtPhoto, thoughtIsPublic, occasionId, userId, callback) {
  var self = this;
  User.findById(userId, function (err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      callback({ code: 404, msg: 'Invalid user' });
    } else {
      Occasion.findById(occasionId, function (error, occasion) {
        if (error) {
          callback(error);
        } else if (occasion.isPublished()) {
              callback({ code: 403, msg: 'Occasion already published' });
            } else {
              self.addThought(thoughtMessage, thoughtPhoto, thoughtIsPublic, occasion._id, user._id, function (er, thought) {
                if (er) {
                  callback(er);
                } else {
                  occasion.addThought(thought._id, function (e) {
                    if (e) {
                      callback(e);
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

thoughtSchema.methods.isCreator = function (userId, callback) {
  var self = this;
  callback(null, self.creator.equals(userId));
}

// When we 'require' this model in another file (e.g. routes),
// we specify what we are importing form this file via module.exports.
// Here, we are 'exporting' the mongoose model object created from
// the specified schema.
module.exports = mongoose.model("Thought", thoughtSchema);
