var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

// Import route handlers
var index = require('./routes/index');
var occasions = require('./routes/occasions');
var users = require('./routes/users');


// Import User model
var User = require('./models/User');
// var NewUser = require('./models/NewUser');

var FACEBOOK_APP_ID = "929113373843865";
var FACEBOOK_APP_SECRET = "c956f3275cd75946929c1fe2591a9b25";

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
passport.serializeUser(function (userId, done) {
  done(null, userId);
});

passport.deserializeUser(function (userId, done) {
  console.log('in deserialize user: ', userId);
  done(null, userId);
});

// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'photos']
  },
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      console.log(profile);
      User.findByFbid(profile.id, function (err, user) {
        if (err)
          done(err);
        if (user) {
          user.updateProfilePicture(profile.photos[0].value, function (er) {
            done(null, user._id);
          });
        } else {
          User.createNewUser(profile.emails[0].value, accessToken, profile.id, profile.displayName, profile.photos[0].value, function (er, newUser) {
            done(null, newUser._id);
          });
        }
      });
    });
  }
));

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile)


app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret : '6170', resave : true, saveUninitialized : true }));

app.use(passport.initialize());
app.use(passport.session());

// Authentication middleware. This function
// is called on _every_ request and populates
// the req.currentUser field with the logged-in
// user object based off the username provided
// in the session variable (accessed by the
// encrypted cookied).

// app.use(function (req, res, next) {
//   if (req.session.passport/*.username*/) {
//     console.log(req.session);
//     User.findByEmail(req.session.username, function (err, user) {
//       if (user) {
//         req.currentUser = user;
//       } else {
//         req.session.destroy();
//       }
//       next();
//     });
//   } else {
//     next();
//   }
// });

// Map paths to imported route handlers
app.use('/', index);
app.use('/occasions', occasions);
app.use('/users', users);

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['user_friends', 'email']}),
  function (req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  }
);

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function (req, res) {
    //TODO: Change this to the landing page of logged in users 
    res.redirect('/');
  }
);

//Logingout
app.get('/logout', 
  function (req, res) {
    req.logout();
    res.redirect('/');
  }
);

// ERROR HANDLERS
// Note: The methods below are called
// only if none of the above routes 
// match the requested pathname.

// Catch 404 and forward to error handler.
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Development error handler.
// Will print stacktraces.
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// Production error handler.
// No stacktraces leaked to user.
app.use(function (err, req, res, next) {
  res.status(err.status || 500).end();
});

module.exports = app;
