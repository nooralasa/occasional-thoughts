var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  createdOccasions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}],
  viewableOccasions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Occasion'}]
});

userSchema.statics.createNewUser = function (email, password, firstName, lastName, callback) {
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
          password: password, 
          firstName: firstName,
          lastName: lastName,
          createdOccasions: [],
          viewableOccasions: []
        }, 
        function (er, record) {
          if (er) {
            callback(er);
          } else {
            callback(null);
          }
        }
      );
    }
  });
}

userSchema.statics.findByEmail = function (email, callback) {
  this.findOne({ 'email': email}, function (err, user) {
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

userSchema.statics.verifyPassword = function (email, candidatepw, callback) {
  this.findByEmail(email, function (err, user) {
    if (err) {
      callback(err);
    } else if (user) {
      if (candidatepw === user.password) {
        callback(null, true); 
      } else {
        callback(null, false);
      }
    } else {
      callback(null, false);
    }
  });
}

userSchema.methods.addCreatedOccasionId = function (occasionId, callback) {
  this.createdOccasions.push(occasionId);
  this.save();
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

module.exports = mongoose.model("User", userSchema);