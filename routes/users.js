var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');

var User = require('../models/User');

var requireLogin = function (req, res, next) {
  if (!req.session.passport || !req.session.passport.user) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    next(); 
  }
};

router.all('*', requireLogin);

router.get('/current', function (req, res) {
  User
    .findById(req.session.passport.user.id)
    .select('name fbid token email createdOccasions')
    .exec(function (err, user) {
      if (err) {
        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
      } else {
        utils.sendSuccessResponse(res, { user: user });
      }
    }
  );
});

module.exports = router;
