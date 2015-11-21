var mongoose = require("mongoose");

var thoughtSchema = mongoose.Schema({
  message: String, 
  photo: String, //not sure what to do for now
  isPublic: Boolean,
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  time: {type: Date, default: Date.now} //auto timestamp
});

thoughtSchema.statics.createThought = function (message, photo, isPublic, userId, callback) {
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

// When we 'require' this model in another file (e.g. routes),
// we specify what we are importing form this file via module.exports.
// Here, we are 'exporting' the mongoose model object created from
// the specified schema.
module.exports = mongoose.model("Thought", thoughtSchema);
