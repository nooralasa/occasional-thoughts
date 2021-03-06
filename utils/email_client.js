// @author: Noor
//This helper function sends emails by using mandril
var email = (function () {
  //requiring the mandrill client to be used for sending emails.
  var mandrill = require('mandrill-api/mandrill');
  var mandrill_client = new mandrill.Mandrill('JNFGVolztHUoggyWoUO31Q');

  //the email obj to be exported
  var _email = {};

  /**
   * sends an email by using mandrill
   *
   * @constructor
   * @param {String} fromName the name of the user sending the email
   * @param {String} fromAddress the email of the user sending the email
   * @param {String} toAddresses a list of emails that we need to email
   * @param {String} innerText the body of the message
   * @param {String} subject the subject of the email to be sent 
   * @param {function} callback a function to be called at the end of the query
   *
   */
  var sendEmail = function (fromName, fromAddress, toAddresses, innerText, subject, callback) {
    var message = {
      html: innerText,
      subject: subject,
      from_email: fromAddress,
      from_name: fromName,
      to: []
    };

    toAddresses.forEach( function (em) {
      message.to.push({
        email: em,
        type: 'to'
      });
    });

    var async = false;
    var ip_pool = null;
    var send_at = null;
    
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function (result) {
      callback(null, result);
    }, function (e) {
      callback(e);
    });
  };


  _email.sendInvitationEmails = function (user_name, user_email, link, emails, callback) {
    var text = '<p>Hello there!<br>'
                +user_name+' invited you to add thoughts to an upcoming occasion. Follow this link to do so.<br>'
                +'<a href="'+link+'">'+link+'</a>'
                +'</p>';
    var subject = "Add your Occasional Thoughts";
    sendEmail(user_name, user_email, emails, text, subject, function (err, result) {
      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
  }

  _email.sendPublishEmails = function (user_name, user_email, link, emails, callback) {
  	console.log("I'm emailing Noor!");
    var text = '<p>Hello there!<br>'
                +user_name+' sent you an eCard for an occasion! Follow this link to view the thoughts.<br>'
                +'<a href="'+link+'">'+link+'</a>'
                +'</p>';
    var subject = "View your Occasional Thoughts";
    sendEmail(user_name, user_email, emails, text, subject, function (err, result) {
      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
  }

  Object.freeze(_email);
  return _email;

})();

module.exports = email;
