var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
  email: String,
  token: String,
  fbid: String,
  name: String,
  profilePicture: String,
  createdOccasions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}],
  viewableOccasions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}]
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
          viewableOccasions: []
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

userSchema.statics.findAllByEmail = function (emails, callback) {
  this.find({ 'email': { $in: emails} }, function (err, users) {
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

userSchema.methods.addViewableOccasionId = function (occasionId, callback) {
  this.viewableOccasions.push(occasionId);
  this.save();
  callback(null);
}

// userSchema.methods.getCreatedOccasionIds = function (callback) {
//   callback(null, this.createdOccasion);
// }

// userSchema.methods.getViewableOccasionIds = function (callback) {
//   callback(null, this.viewableOccasion);
// }

module.exports = mongoose.model("NewUser", userSchema);