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
  var dateStr = getDateStr();
  //res.render('occasions', {User: "Noor"});
  res.render('index');
  //res.render('dashboard', {Name: "Angus Lai"});
  console.log("I am in the routes/index file");
});


module.exports = router;
