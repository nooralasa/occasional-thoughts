var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');

var User = require('../models/User');

/*
  Require authentication on ALL access to /notes/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function (req, res, next) {
  if (!req.session.passport || !req.session.passport.user) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    req.occasion.isParticipantOrCreator(req.session.passport.user, function (err, canView) {
      if (canView) {
        next();
      } else {
        utils.sendErrResponse(res, 404, 'Resource not found.');
      }
    });
  }
};

var requireLogin = function (req, res, next) {
  if (!req.session.passport || !req.session.passport.user) {
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
  req.occasion.isCreator(req.session.passport.user, function (isCreator) {
    if (isCreator) {
      next();
    } else {
      utils.sendErrResponse(res, 404, 'Resource not found.');
    }
  });
};

/*
  For create and edit requests, require that the request body
  contains a 'content' field. Send error code 400 if not.
*/
var requireContent = function (req, res, next) {
  if (!req.body.title) {
    utils.sendErrResponse(res, 400, 'Content required in request.');
  } else {
    next();
  }
};

// Register the middleware handlers above.
router.all('*', requireLogin);

/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
  2. If accessing or modifying a specific resource, the client must own that note
  3. Requests are well-formed
*/

/*
  GET /occasion
  No request parameters
  Response:
    - success: true if the server succeeded in getting the user's notes
    - content: on success, an object with a single field 'notes', which contains a list of all the notes
    - err: on failure, an error message
*/
router.get('/current', function (req, res) {
  User
    .findById(req.session.passport.user)
    .select('name fbid token')
    .exec(function (err, user) {
      if (err) {
        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
      } else {
        // res.render('occasions', { user: user });
        utils.sendSuccessResponse(res, { user: user });
      }
    }
  );
});

module.exports = router;
