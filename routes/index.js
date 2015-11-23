var express = require('express');
var router = express.Router();

var User = require('../models/User');

/* GET home page. */
router.get('/', function(req, res) {

   //res.render('occasions', {user: {name:"Noor", createdOccasions: [{title: "Birthday", coverPhoto: "http://lorempixum.com/100/100/nature/4", description: "This is a party for a special baby. His name is Esa. "}], viewableOccasions: []}});
  /*res.render('occasion', {occasion: {title:"Noor's Graduation", 
    coverPhoto: "http://2.bp.blogspot.com/-WxTp19q1Z5w/UcbZp8hkFfI/AAAAAAAAQDc/Ho92XkGevD0/s1600/watermarked_cover333.jpg", 
    description: "This is a party for Noor as he enters his final year of college ", 
    creator: "Angus Lai", 
    isPublished: false,
    thoughts: [{message: "I am so happy for you. You deserve the best! Stay blessed!" , 
                                      photo: "http://cdn.toonvectors.com/images/40/14323/toonvectors-14323-140.jpg", 
                                      creator: {firstName: "Erjona", lastName: "Topalli"}}] 
    }});
*/   

  if (!req.session.passport || !req.session.passport.user) {

    res.render('index');
  } else {
    User.findById(req.session.passport.user, function (err, user) {
      res.render('dashboard', { name: user.name });
    })
  }
});




module.exports = router;
