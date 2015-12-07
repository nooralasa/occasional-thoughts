/**
  Includes backend functionality of all buttons in the occasion page
  Specifically covers the request to the backend pertaining the editing 
  and deletion of thoughts. 
**/

$(window).load(function(){
  $('.coverContainer').find('img').each(function(){
    var imgClass = (this.width/this.height > 1) ? 'wide' : 'tall';
    $(this).addClass(imgClass);
  });
});


$(document).on('click', '#add-thought', function(evt) {
  evt.preventDefault();
  var message = document.getElementById('thought-message').value;
  $('#thought-message').val('');
  var id = $("input[name=occasionId]").val();
  var name = $("input[name=userName]").val();
  var photo = $("input[name=profilePicture]").val();
  var thoughtPicture = $("input[name=thoughtPicture]").val(); 
  $.post('/occasions/'+id+"/thoughts", 
    {message: message, 
      photo:thoughtPicture,
      isPublic: true}
    ).done(function(response) {
      $('#thought-list').append( 
        '<div class= "thought-box"> <li style="position:relative" class="thought"><img src='+photo +'><h3 align="left">'
        + name +'</h3><p align= "left">'+ message +'</p>'+'</li></div>'
      ); 

      window.location.replace("/occasions/"+id)
    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    }
  );
});

$(document).on('click', '.delete-thought', function(evt) {
  evt.preventDefault();
  var occasion_id = $("input[name=occasionId]").val();
  var thought_id = $(this).parent().parent().attr('id');
  
  $.ajax({
    url: '/occasions/'+occasion_id+'/thoughts/'+thought_id,
    type: 'DELETE',
    success: function(result) {
      $('#'+thought_id).remove();
    }
  });
});

$(document).on('click', '#upload', function(evt) {
    var url = $('#url').val();
    $('#previewImg').attr('src', url);
    $("#preview").show(50);
});

$(document).on('click', '#editPreviewBtn', function(evt) {
    var url = $('#editUrl').val();
    $('#editPreviewImg').attr('src', url);
    $("#editPreview").show(50);
});


$(document).on('click', '.edit-thought', function(evt) {
  evt.preventDefault();
  var occasion_id = $("input[name=occasionId]").val();
  var thought_id = $(this).parent().parent().attr('id');
  if ($('#photo_'+thought_id).attr('src')!= undefined){
    var lastUrl = $('#photo_'+thought_id).attr('src');  
  } else lastUrl = "";
  
  var modal = document.getElementById('editThoughtModal');

  $('#editThoughtModal').modal('show')
  document.getElementById("edited-thought").value =  $('#message_'+thought_id).text();
  document.getElementById("editUrl").value = lastUrl;
  $('input[name="edit-thought-id"]').val(thought_id);
  $('input[name="occasion-id"]').val(occasion_id);
});

$(document).on('click', '#done-edit-thought', function(evt){
  evt.preventDefault();
  var thought_id = $('input[name="edit-thought-id"]').val();
  var occasion_id = $('input[name="occasion-id"]').val();
  var editedMessage = document.getElementById("edited-thought").value;
  var editedThoughtPhoto = document.getElementById("editUrl").value;

  $.post("/occasions/"+ occasion_id+"/thoughts/" +thought_id, 
    {message: editedMessage, 
    photo: editedThoughtPhoto,
    isPublic: true}
  ).done(function(response) {
    $('#editThoughtModal').modal('hide');
    $('#message_'+thought_id).text(editedMessage);
    $('#photo_'+thought_id).attr('src', editedThoughtPhoto);

  }).fail(function(responseObject){
    var response = $.parseJSON(responseObject.responseText);
    $('.error').text(response.err);
  })
});
