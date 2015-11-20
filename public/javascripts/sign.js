$(document).on('click', '#signingIn', function(evt) {

  var email = document.getElementById('sign_email').value;
  var password = document.getElementById('sign_password').value;

  console.log("Information submitted");
    $.post(
    '/sign',
      {email: email, password: password}
    ).done(function(response) {
      console.log("Post req sent");
    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    });

});