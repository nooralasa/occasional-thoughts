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
  //res.render('occasions', {user: {name:"Noor", createdOccasions: [{title: "Birthday", coverPhoto: "http://lorempixum.com/100/100/nature/4", description: "This is a party for a special baby. His name is Esa. "}], viewableOccasions: []}});
  //res.render('index');
  res.render('occasion', {occasion: {title:"Noor's Graduation", 
    coverPhoto: "http://cdn.images.express.co.uk/img/dynamic/14/590x/champagne-419634.jpg", 
    description: "This is a party for Noor as he enters his final year of college ", 
    creator: "Angus Lai"}});
  console.log("I am in the routes/index file");
});


module.exports = router;
