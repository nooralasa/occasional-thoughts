var express = require('express');
var router = express.Router();

var getDateStr = function () {
  // We've seen that new/this can be a bad, but sometimes you'll see them in JavaScript code. For
  // example, to create a date, you have to use new.
  var date = new Date();
  var dateStr = date.toLocaleString("en-us", 
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return dateStr;
}

/* GET home page. */
router.get('/', function(req, res) {
	console.log("inside get register")
	var dateStr = getDateStr();
	res.render('register');
<<<<<<< HEAD
=======

});

router.post('/', function(req, res){
	console.log("In routes/register/post");
	
>>>>>>> a05fb7dfc2741c8da6b36dfb97851c5bdabe1289
});

module.exports = router;
