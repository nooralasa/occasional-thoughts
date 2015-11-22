var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');

var User = require('../models/User');
var Occasion = require('../models/Occasion');

/*
  Require authentication on ALL access to /notes/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function (req, res, next) {
  if (!req.session.passport || !req.session.passport.user) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    req.occasion.isParticipantOrCreator(req.session.passport.user._id, function (canView) {
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
  req.occasion.isCreator(req.session.passport.user._id, function (isCreator) {
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

/*angus*/
router.param('occasionId', function (req, res, next, occasionId) {
  Occasion
    .findById(occasionId)
    .populate('thoughts')
    .exec(function (err, occasion) {
      if (occasion) {
        req.occasion = occasion;
        next();
      } else {
        utils.sendErrResponse(res, 404, 'Resource not found.');
      }
    }
  );
});

// Register the middleware handlers above.
router.all('*', requireLogin);
router.all('/:occasionId', requireOwnership);
router.post('*', requireContent);

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
router.get('/', function (req, res) {
  // res.render('index', { date : dateStr });
  User
    .findById(req.session.passport.user._id)
    .populate('createdOccasions')
    .exec(function (err, user) {
      if (err) {
        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
      } else {
        /*angus*/
        // render ejs
        // res.render('xx', { createdOccasions: user.createdOccasions });
        utils.sendSuccessResponse(res, { createdOccasions: user.createdOccasions });
      }
    }
  );
});


/*
  GET /occasion/:occasionId
  Request parameters:
    - note: the unique ID of the note within the logged in user's note collection
  Response:
    - success: true if the server succeeded in getting the user's notes
    - content: on success, the note object with ID equal to the note referenced in the URL
    - err: on failure, an error message
*/
router.get('/:occasionId', function (req, res) {
  /*angus*/
  // res.render('yy', { occasion: req.occasion })
  utils.sendSuccessResponse(res, req.occasion);
});



/////////////////////////////////////////////////////////////////////////////////////////////////
// everything below is a work in progress
/////////////////////////////////////////////////////////////////////////////////////////////////


/*
  POST /occasions
  Request body:
    - content: the content of the note
  Response:
    - success: true if the server succeeded in recording the user's note
    - err: on failure, an error message
*/
router.post('/', function (req, res) {
  User.findById(req.session.passport.user._id, function (err, user) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else if (!user) {
      utils.sendErrResponse(res, 404, 'Invalid user');
    } else {
      Occasion.createOccasion(req.body.title, req.body.description, req.body.coverPhoto, user._id, function (er, occasion) {
        if (er) {
          utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        } else {
          user.addCreatedOccasionId(occasion._id, function (e) {
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



router.post('/:occasionId', function (req, res) {
  User.findById(req.session.passport.user._id, function (err, user) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else if (!user) {
      utils.sendErrResponse(res, 404, 'Invalid user');
    } else {
      Occasion.createOccasion(req.body.title, req.body.description, req.body.coverPhoto, user._id, function (er, occasion) {
        if (er) {
          utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        } else {
          user.addCreatedOccasionId(occasion._id, function (e) {
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
// router.delete('/:tweet', function (req, res) {
//   User.findByUsername(req.currentUser.username, function (err, user) {
//     if (err) {
//       utils.sendErrResponse(res, 500, 'An unknown error occurred.');
//     } else if (!user) {
//       utils.sendErrResponse(res, 404, 'Invalid user');
//     } else {
//       User.removeTweet(req.currentUser.username, req.tweet._id, function (er) {
//         if (er) {
//           utils.sendErrResponse(res, 500, 'An unknown error occurred.');
//         } else {
//           Tweet.removeTweet(req.tweet._id, function (e) {
//             if (e) {
//               utils.sendErrResponse(res, 500, 'An unknown error occurred.');
//             } else {
//               utils.sendSuccessResponse(res);
//             }
//           });
//         }
//       })
//     }
//   });
// });

module.exports = router;
