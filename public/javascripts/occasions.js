// Wrap in an immediately invoked function expression.
(function() {
  $(document).on('submit', '#myOccasionsBtn', function(evt) {
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
  var occasion_id = $(this).parent().attr('id');
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
  var description= $(this).parent().find('p').text();
  var title = $(this).parent().find('h3').text();
  var lastUrl = $(this).parent().find('img').attr('src');
  var modal = document.getElementById('editOccasionModal');
  var occasion_id = $(this).parent().attr('id');

  $('#editOccasionModal').modal('show');
  document.getElementById('edited-description').value = description;
  document.getElementById('edited-title').value = title;
  document.getElementById('url').value = lastUrl; 
  $('input[name="edit-occasion-id"]').val(occasion_id);
});

$(document).on('click', '#done-edit-occasion', function(evt) {
  evt.preventDefault();
  var id = $('input[name="edit-occasion-id"]').val();
  var editedTitle = $('#edited-title').val();
  var editedDescription  = $('#edited-description').val();
  var editedPhoto = $('#url').val();

  $.post(
    '/occasions/'+id, 
    {title: editedTitle, 
      description: editedDescription, 
      coverPhoto: editedPhoto}
  ).done(function(response) {
    $('#editOccasionModal').modal('hide');
    $('#'+id).find('p').text(editedDescription);
    $('#'+id).find('h3').text(editedTitle);
    $('#'+id).find('img').attr('src', editedPhoto);

  }).fail(function(responseObject){
    console.log('failed!');
  });
})