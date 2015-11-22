$(document).on('click', '#registering', function(evt) {

	console.log("registration form CLICKED");
	var firstName = document.getElementById('firstName').value;
  var lastName = document.getElementById('lastName').value;
	var password = document.getElementById('password').value;
	var confirmation = document.getElementById('confirmPassword').value;
	var email = document.getElementById('email').value;

    $.post(
    '/register',
    {first: firstName, last: lastName, email: email, password: password, confirmation: confirmation}
      
    ).done(function(response) {
      console.log("Post req sent");

    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    });

});
