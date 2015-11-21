$(document).on('click', '#registering', function(evt) {

	console.log("registration form CLICKED");
	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;
	var confirmation = document.getElementById('confirmPassword').value;
	var email = document.getElementById('email').value;

  console.log(username, password, confirmation, email);
    $.post(
    '/register',
    {username: username, email: email, password: password, confirmation: confirmation}
      
    ).done(function(response) {
      console.log("Post req sent");

    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    });

});
