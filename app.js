var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var session = require('express-session');
var bodyParser = require('body-parser');
require('handlebars/runtime');

//facebook oauth
var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;

var FACEBOOK_APP_ID = "929113373843865";
var FACEBOOK_APP_SECRET = "c956f3275cd75946929c1fe2591a9b25";

// Import route handlers
var index = require('./routes/index');
var users = require('./routes/users');
// var occasions = require('./routes/occasions');
// var thoughts = require('./routes/thoughts');

// Import User model
var User = require('./models/User')



var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/fritter');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/mymongodb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("database connected");
});

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // // find the user in the database based on their facebook id
      // User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

      //     // if there is an error, stop everything and return that
      //     // ie an error connecting to the database
      //     if (err)
      //         return done(err);

      //     // if the user is found, then log them in
      //     if (user) {
      //         return done(null, user); // user found, return that user
      //     } else {
      //         // if there is no user found with that facebook id, create them
      //         var newUser            = new User();

      //         // set all of the facebook information in our user model
      //         newUser.facebook.id    = profile.id; // set the users facebook id                   
      //         newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
      //         newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
      //         newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

      //         // save our user to the database
      //         newUser.save(function(err) {
      //             if (err)
      //                 throw err;

      //             // if successful, return the new user
      //             return done(null, newUser);
      //         });
      //     }

      // });
      
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));


var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile)

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret : '6170', resave : true, saveUninitialized : true }));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware. This function
// is called on _every_ request and populates
// the req.currentUser field with the logged-in
// user object based off the username provided
// in the session variable (accessed by the
// encrypted cookied).
app.use(function (req, res, next) {
  if (req.session.username) {
    User.findByUsername(req.session.username, function (err, user) {
      if (user) {
        req.currentUser = user;
      } else {
        req.session.destroy();
      }
      next();
    });
  } else {
      next();
  }
});

// Map paths to imported route handlers
app.use('/', index);
app.use('/users', users);
// app.use('/occasions', occasions);
// app.use('/thoughts', thoughts);


// ERROR HANDLERS
// Note: The methods below are called
// only if none of the above routes 
// match the requested pathname.

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// =====================================
// FACEBOOK ROUTES =====================
// =====================================
// route for facebook authentication and login
app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/register',
        failureRedirect : '/'
    }));

// Development error handler.
// Will print stacktraces.
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// Production error handler.
// No stacktraces leaked to user.
app.use(function(err, req, res, next) {
  res.status(err.status || 500).end();
});

module.exports = app;
