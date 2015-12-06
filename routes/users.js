var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');

var User = require('../models/User');

/*
  Require authentication on ALL access to /notes/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireLogin = function (req, res, next) {
  if (!req.session.passport || !req.session.passport.user) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
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
    .findById(req.session.passport.user.id)
    .select('name fbid token email createdOccasions')
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
