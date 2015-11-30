// Wrap in an immediately invoked function expression.
(function() {
  $(document).on('submit', '#myOccasionsBtn', function(evt) {
    console.log("CLICKED CREATE OCCASION")
    evt.preventDefault();
    $.get(
      '/occasions',
      helpers.getFormData(this)
    ).done(function(response) {
      currentUser = response.content.user;
      loadHomePage();
    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    });
  });
})();

$(document).on('click', '#delete-occasion', function(evt) {
  evt.preventDefault();
  console.log("Delete occasion")
  
});

$(document).on('click', '#edit-occasion', function(evt) {
  evt.preventDefault();
  console.log("Edit occasion")
});

