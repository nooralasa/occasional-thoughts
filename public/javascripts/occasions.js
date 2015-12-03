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

$(document).on('click', '.delete-occasion', function(evt) {
  evt.preventDefault();
  console.log("Delete occasion")
  var occasion_id = $(this).parent().attr('id');

  console.log("occasion id is", occasion_id);
  $.ajax({
    url: '/occasions/'+occasion_id,
    type: 'DELETE',
    success: function(result) {
      $('#'+occasion_id).remove();
    }
  });
});

$(document).on('click', '.edit-occasion', function(evt) {
  evt.preventDefault();
  console.log("Edit occasion");
  var modal = document.getElementById('createOccasionModal');
  //console.log(modal);
    $.get(
    '/occasions',
    helpers.getFormData(modal)
  ).done(function(response) {
    $('#createOccasionModal').modal('show')
  }).fail(function(responseObject) {
    var response = $.parseJSON(responseObject.responseText);
    $('.error').text(response.err);

  });
});

