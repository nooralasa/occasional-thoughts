// @author: Noor
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('JNFGVolztHUoggyWoUO31Q');

var sendEmails = function(user_name, user_email, link, emails) {

	var message = {
	    "html": "<p>Hello there!<br>"+user_name+" invited you to add thoughts to an"+
	    " upcoming occasion. Follow this link to do so.<br><a href="
	    +link+">"+link+"</a></p>",
	    "subject": "Add your Occasional Thoughts",
	    "from_email": user_email,
	    "from_name": user_name,
	    "to": [],
	    "important": false
	};

	emails.forEach( function(e) {
	    message.to.push({
	        email: e,
	        type: 'to'
	    });
	});

	var async = false;
	var ip_pool = null;
	var send_at = null;

	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
	    console.log(result);	    
	    [{
	            "email": "recipient.email@example.com",
	            "status": "sent",
	            "reject_reason": "hard-bounce",
	            "_id": "abc123abc123abc123abc123abc123"
	        }]
	    
	}, function(e) {
	    // Mandrill returns the error as an object with name and message keys
	    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}

