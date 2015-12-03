
var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');

var User = require('../models/User');
var Occasion = require('../models/Occasion');
var Thought = require('../models/Thought');

/*
  Require authentication on ALL access to /notes/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireLogin = function (req, res, next) {
  if (!req.session.passport || !req.session.passport.user) {
    res.redirect('/auth/facebook/occasions'+req.params[0]);
    // utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    next(); 
  }
};

var requireViewPermission = function (req, res, next) {
  if (!req.session.passport || !req.session.passport.user) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    req.occasion.isParticipantOrCreator(req.session.passport.user.id, function (err, canView) {
      if (canView) {
        next();
      } else {
        utils.sendErrResponse(res, 404, 'Resource not found.');
      }
    });
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
var requireOccasionOwnership = function (req, res, next) {
  req.occasion.isCreator(req.session.passport.user.id, function (err, isCreator) {
    if (isCreator) {
      next();
    } else {
      utils.sendErrResponse(res, 404, 'Resource not found.');
    }
  });
};

var requireThoughtOwnership = function (req, res, next) {
  req.thought.isCreator(req.session.passport.user.id, function (err, isCreator) {
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
  if (!req.body.title && !req.body.message) {
    utils.sendErrResponse(res, 400, 'Content required in request.');
  } else {
    next();
  }
};

/*
  Grab a note from the store whenever one is referenced with an ID in the
  request path (any routes defined with :note as a paramter).
*/

router.param('occasionId', function (req, res, next, occasionId) {
  Occasion.populateOccasion(occasionId, function (err, occasion) {
    if (err) {
      utils.sendErrResponseGivenError(res, err);
    } else {
      req.occasion = occasion;
      next();
    }
  });
});


router.param('thoughtId', function (req, res, next, thoughtId) {
  Thought.getThought(thoughtId, function (err, thought) {
    if (err) {
      utils.sendErrResponseGivenError(res, err);
    } else {
      var inOccasion = req.occasion.thoughts.filter(function (currentThought) {
        return currentThought._id.equals(thought._id);
      });
      if (inOccasion.length === 1) {
        req.thought = thought;
        next();
      } else {
        utils.sendErrResponseGivenError(res, { code: 403, msg: "Thought does not belong to Occasion"});
      }
    }
  });
});

// Register the middleware handlers above.
router.all('*', requireLogin);

router.get('/:occasionId', requireViewPermission);
router.post('/:occasionId', requireOccasionOwnership);
router.delete('/:occasionId', requireOccasionOwnership);

router.post('/:occasionId/thought', requireViewPermission);

router.post('/:occasionId/thought/:thoughtId', requireThoughtOwnership);
router.delete('/:occasionId/thought/:thoughtId', requireThoughtOwnership);

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
  User.findAllOccasions(req.session.passport.user.id, function (err, user) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      res.render('occasions', { user: user });
    }
  })
});

/*
  POST /occasions
  Request body:
    - content: the content of the note
  Response:
    - success: true if the server succeeded in recording the user's note
    - err: on failure, an error message
*/
router.post('/', function (req, res) {
  Occasion.createOccasion(req.body.title, 
                          req.body.description, 
                          req.body.coverPhoto, 
                          req.body.participants, 
                          req.body.recipients, 
                          req.session.passport.user.id, 
                          req.body.publishTime,
                          function (err) {
                            if (err) {
                              utils.sendErrResponseGivenError(res, err);
                            } else {
                              utils.sendSuccessResponse(res);
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
  //angus TODO change user to user's name
  res.render('occasion', { occasion: req.occasion, user: req.session.passport.user });
});

// edit occasion
router.post('/:occasionId', function (req, res) {
  Occasion.editOccasion(req.occasion._id, 
                        req.body.title, 
                        req.body.description, 
                        req.body.coverPhoto, 
                        req.body.removeParticipants, 
                        req.body.newParticipants, 
                        req.body.removeRecipients, 
                        req.body.newRecipients,
                        function (err) {
                          if (err) {
                            utils.sendErrResponseGivenError(res, err);
                          } else {
                            utils.sendSuccessResponse(res);
                          }
                        }
  );
});

/*
  DELETE /occasions/:occasionId
  Request parameters:
    - note ID: the unique ID of the note within the logged in user's note collection
  Response:
    - success: true if the server succeeded in deleting the user's note
    - err: on failure, an error message
*/
router.delete('/:occasionId', function (req, res) {
  Occasion.removeOccasion(req.occasion._id, function (err) {
    if (err) {
      utils.sendErrResponseGivenError(res, err);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});


// add new thought
router.post('/:occasionId/thoughts', function (req, res) {
  Thought.createThought(req.body.message, req.body.photo, req.body.isPublic, req.occasion._id, req.session.passport.user.id, function (err) {
    if (err) {
      utils.sendErrResponseGivenError(res, err);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

// edit thought
router.post('/:occasionId/thoughts/:thoughtId', function (req, res) {
  Thought.editThought(req.thought._id, req.body.message, req.body.photo, req.body.isPublic, function (err) {
    if (err) {
      utils.sendErrResponseGivenError(res, err);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

// delete thought
router.delete('/:occasionId/thoughts/:thoughtId', function (req, res) {
  Thought.removeThought(req.thought._id, req.occasion._id, function (err) {
    if (err) {
      utils.sendErrResponseGivenError(res, err);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

module.exports = router;
