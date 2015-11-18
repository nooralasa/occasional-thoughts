var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');

/* GET register page. */
router.get('/', function(req, res) {
  console.log("I am in the routes/register file");
  //utils.sendSuccessResponse(res);

  res.render('register');
  console.log(" After rendering: I am in the routes/register file");
});

module.exports = router;
