var mongoose = require("mongoose");
var User = require('./User');
var Occasion = require('./Occasion');

//This is how a thought is represented in our database. 
var thoughtSchema = mongoose.Schema({
  message: String, //the text body of the thought
  photo: String, //the url to the photo 
  isPublic: Boolean, //privacy setting of a thought
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //the user who added the thought
  occasion: {type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}, //the occasion the thought belongs to
  time: {type: Date, default: Date.now} //auto timestamp
});

/**
 * creates the thought within the schema
 *
 * @constructor
 * @param {String} message the text body of the thought 
 * @param {String} photo the url to a photo associated with the thought
 * @param {Boolean} isPublic the privacy setting of the thought
 * @param {String} occasionId the id of the occasion to which the thought belongs
 * @param {String} userId the id of the (current) user who created the thought
 * @param {function} callback a function to be called at the end of the query
 *
 */
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

/**
 * returns the relevant thought by querying its id
 *
 * @param {String} thoughId the id of the thought in concern
 * @param {function} callback a function to be called at the end of the query
 *
 */
thoughtSchema.statics.getThought = function (thoughtId, callback) {
  this.findOne({ '_id': thoughtId }, function (err, thought) {
    if (err) {
      callback(err);
    } else {
      callback(null, thought);
    }
  });
}

/**
 * soft delete of the identified thought
 *
 * @param {String} thoughId the id of the thought in concern
 * @param {String} occasionId the id of the occasion thr thought belongs to
 * @param {function} callback a function to be called at the end of the query
 *
 */
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
            }
          });
        }
      });
    }
  });
}

/**
 * edits the thought of concern
 *
 * @param {String} thoughId the id of the thought in concern
 * @param {String} newMessage the new text body of the thought 
 * @param {String} newPhoto the new url to a photo associated with the thought
 * @param {Boolean} newIsPublic the new privacy setting of the thought
 * @param {function} callback a function to be called at the end of the query
 *
 */
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

/**
 * adds the thought to the database and handels all the necessary steps to successfully setup the thought entry
 *
 * @param {String} thoughtMessage the text body of the thought
 * @param {String} thoughtPhoto the url to the photo of the thought
 * @param {Boolean} thoughtIsPublic the privacy setting of the thought
 * @param {String} occasionId the id of the occasion to which the thought belongs
 * @param {String} userId the id of the (current) user who created the thought
 * @param {function} callback a function to be called at the end of the query
 *
 */
thoughtSchema.statics.addThoughtEntry = function (thoughtMessage, thoughtPhoto, thoughtIsPublic, occasionId, userId, callback) {
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

/**
 * returns true if the user is the creator of the thought
 *
 * @param {String} userId the id of the user of concern
 * @param {function} callback a function to be called at the end of the query
 *
 */
thoughtSchema.methods.isCreator = function (userId, callback) {
  var self = this;
  callback(null, self.creator.equals(userId));
}

// Exporting the mongoose object to be used elsewhere in the code
module.exports = mongoose.model("Thought", thoughtSchema);
