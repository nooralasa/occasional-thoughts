
var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');

var User = require('../models/User');
var Occasion = require('../models/Occasion');
var Thought = require('../models/Thought');

var requireLogin = function (req, res, next) {
  if (!req.session.passport || !req.session.passport.user) {
    res.redirect('/auth/facebook/occasions'+req.params[0]);
  } else {
    next(); 
  }
};

var requireViewPermission = function (req, res, next) {
  if (!req.session.passport || !req.session.passport.user) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    req.occasion.canView(req.session.passport.user.id, function (err, canView) {
      console.log('canview ' + canView);
      if (canView) {
        next();
      } else {
        res.render('404');
      }
    });
  }
};

var requireParticipationPermission = function (req, res, next) {
  if (!req.session.passport || !req.session.passport.user) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    if (req.occasion.isPublished()) {
      console.log('participant 404 - event published');
      res.render('404');
    } else {
      if (req.occasion.participantIsPublic) {
        next();
      } else {
        req.occasion.isParticipantOrCreator(req.session.passport.user.id, function (err, canView) {
          if (canView) {
            next();
          } else {
            console.log('participant 404');
            res.render('404');
          }
        });
      }
    }
  }
};

var requireOccasionOwnership = function (req, res, next) {
  req.occasion.isCreator(req.session.passport.user.id, function (err, isCreator) {
    if (isCreator) {
      next();
    } else {
      console.log('occ own 404');
      res.render('404');
    }
  });
};

var requireThoughtOwnership = function (req, res, next) {
  req.thought.isCreator(req.session.passport.user.id, function (err, isCreator) {
    if (isCreator) {
      next();
    } else {
      console.log('thought own 404')
      res.render('404');
    }
  });
};

var requireThoughtOwnershipOrOccasionCreator = function (req, res, next) {
  req.occasion.isCreator(req.session.passport.user.id, function (er, isOccCreator) {
    if (isOccCreator) {
      next();
    } else {
      req.thought.isCreator(req.session.passport.user.id, function (err, isCreator) {
        if (isCreator) {
          next();
        } else {
          console.log('thought own 404')
          res.render('404');
        }
      });
    }
  });
};

var requireContent = function (req, res, next) {
  if (!req.body.title && !req.body.message) {
    utils.sendErrResponse(res, 400, 'Content required in request.');
  } else {
    next();
  }
};

router.param('occasionId', function (req, res, next, occasionId) {
  Occasion.populateOccasion(occasionId, req.session.passport.user.id, function (err, occasion) {
    if (err) {
      res.render('404');
    } else {
      req.occasion = occasion;
      next();
    }
  });
});


router.param('thoughtId', function (req, res, next, thoughtId) {
  Thought.getThought(thoughtId, function (err, thought) {
    if (err) {
      res.render('404');
    } else {
      var inOccasion = req.occasion.thoughts.filter(function (currentThought) {
        return currentThought._id.equals(thought._id);
      });
      if (inOccasion.length === 1) {
        req.thought = thought;
        next();
      } else {
        res.render('404');
      }
    }
  });
});

// Register the middleware handlers above.
router.all('*', requireLogin);

router.post('/:occasionId/thoughts/:thoughtId', requireThoughtOwnership);
router.delete('/:occasionId/thoughts/:thoughtId', requireThoughtOwnershipOrOccasionCreator);

router.post('/:occasionId/thoughts', requireParticipationPermission);

router.get('/:occasionId', requireViewPermission);
router.post('/:occasionId', requireOccasionOwnership);
router.delete('/:occasionId', requireOccasionOwnership);



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
  Occasion.addOccasionEntry(req.body.title, 
                          req.body.description, 
                          req.body.coverPhoto, 
                          req.body.participants, 
                          req.body.recipients, 
                          req.body.participantIsPublic,
                          req.body.recipientIsPublic,
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
  Thought.addThoughtEntry(req.body.message, req.body.photo, req.body.isPublic, req.occasion._id, req.session.passport.user.id, function (err) {
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
