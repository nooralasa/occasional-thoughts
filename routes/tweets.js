var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');

var User = require('../models/User');
var Tweet = require('../models/Tweet');

/*
  Require authentication on ALL access to /notes/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function (req, res, next) {
  if (!req.currentUser) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    next();
  }
};

/*
  Require ownership whenever accessing a particular note
  This means that the client accessing the resource must be logged in
  as the user that originally created the note. Clients who are not owners 
  of this particular resource will receive a 404.

  Why 404? We don't want to distinguish between notes that don't exist at all
  and notes that exist but don't belong to the client. This way a malicious client
  that is brute-forcing urls should not gain any information.
*/
var requireOwnership = function (req, res, next) {
  if (String(req.currentUser._id) !== String(req.tweet.creator)) {
    utils.sendErrResponse(res, 404, 'Resource not found.');
  } else {
    next();
  }
};

/*
  For create and edit requests, require that the request body
  contains a 'content' field. Send error code 400 if not.
*/
var requireContent = function (req, res, next) {
  if (!req.body.content) {
    utils.sendErrResponse(res, 400, 'Content required in request.');
  } else {
    next();
  }
};

/*
  Grab a note from the store whenever one is referenced with an ID in the
  request path (any routes defined with :note as a paramter).
*/
router.param('tweet', function (req, res, next, tweetId) {

  // Tweet.getDescription(function (tweetId)) /*+*/
  Tweet.getTweet(tweetId, function (err, tweet) {
    if (tweet) {
      req.tweet = tweet;
      next();
    } else {
      utils.sendErrResponse(res, 404, 'Resource not found.');
    }
  });
});

// Register the middleware handlers above.
router.all('*', requireAuthentication);
router.all('/:tweet', requireOwnership);
router.post('*', requireContent);

/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
  2. If accessing or modifying a specific resource, the client must own that note
  3. Requests are well-formed
*/

/*
  GET /notes
  No request parameters
  Response:
    - success: true if the server succeeded in getting the user's notes
    - content: on success, an object with a single field 'notes', which contains a list of all the notes
    - err: on failure, an error message
*/
router.get('/', function (req, res) {
  Tweet.getTweets(req.currentUser.username, function (err, tweets) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      utils.sendSuccessResponse(res, { tweets: tweets });
    }
  });
});


/*
  GET /notes/:note
  Request parameters:
    - note: the unique ID of the note within the logged in user's note collection
  Response:
    - success: true if the server succeeded in getting the user's notes
    - content: on success, the note object with ID equal to the note referenced in the URL
    - err: on failure, an error message
*/
router.get('/:tweet', function (req, res) {
  utils.sendSuccessResponse(res, req.tweet);
});

/*
  POST /notes
  Request body:
    - content: the content of the note
  Response:
    - success: true if the server succeeded in recording the user's note
    - err: on failure, an error message
*/
router.post('/', function (req, res) {
  User.findByUsername(req.currentUser.username, function (err, user) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else if (!user) {
      utils.sendErrResponse(res, 404, 'Invalid user');
    } else {
      Tweet.addTweet(req.body.content, user._id, req.body.retweetedFrom, function (er, tweet) {
        if (er) {
          utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        } else {
          User.addTweet(req.currentUser.username, tweet._id, function (e) {
            if (e) {
              utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            } else {
              utils.sendSuccessResponse(res);
            }
          });
        }
      });
    }
  });
});

/*
  DELETE /notes/:note
  Request parameters:
    - note ID: the unique ID of the note within the logged in user's note collection
  Response:
    - success: true if the server succeeded in deleting the user's note
    - err: on failure, an error message
*/
router.delete('/:tweet', function (req, res) {
  User.findByUsername(req.currentUser.username, function (err, user) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else if (!user) {
      utils.sendErrResponse(res, 404, 'Invalid user');
    } else {
      User.removeTweet(req.currentUser.username, req.tweet._id, function (er) {
        if (er) {
          utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        } else {
          Tweet.removeTweet(req.tweet._id, function (e) {
            if (e) {
              utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            } else {
              utils.sendSuccessResponse(res);
            }
          });
        }
      })
    }
  });
});

module.exports = router;
