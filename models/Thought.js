var mongoose = require("mongoose");
var User = require('./User');
var Occasion = require('./Occasion');

var thoughtSchema = mongoose.Schema({
  message: String, 
  photo: String, //not sure what to do for now
  isPublic: Boolean,
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  time: {type: Date, default: Date.now} //auto timestamp
});

thoughtSchema.statics.addThought = function (message, photo, isPublic, userId, callback) {
  this.create(
    {
      message: message,
      photo: photo,
      isPublic: isPublic,
      creator: userId
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

thoughtSchema.statics.createThought = function (thoughtMessage, thoughtPhoto, thoughtIsPublic, occasionId, userId, callback) {
  var self = this;
  User.findById(userId, function (err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      callbacl({ code: 404, msg: 'Invalid user' });
    } else {
      self.addThought(thoughtMessage, thoughtPhoto, thoughtIsPublic, user._id, function (er, thought) {
        if (er) {
          callback(er);
        } else {
          Occasion.findById(occasionId, function (error, occasion) {
            if (error) {
              callback(error);
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

// When we 'require' this model in another file (e.g. routes),
// we specify what we are importing form this file via module.exports.
// Here, we are 'exporting' the mongoose model object created from
// the specified schema.
module.exports = mongoose.model("Thought", thoughtSchema);
