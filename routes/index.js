var express = require('express');
var router = express.Router();

var User = require('../models/User');

var response = function (req, res) {
  if (req.session.passport && req.session.passport.user) {
    User.findById(req.session.passport.user.id, function (err, user) {
      res.render('dashboard', { name: user.name });
    });  
  } else {
    res.render('index');
  }
}


/* GET home page. */
router.get('/', response);
router.post('/', response);

module.exports = router;
