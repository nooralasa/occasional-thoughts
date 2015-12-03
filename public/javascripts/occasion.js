
$(window).load(function(){
 $('.coverContainer').find('img').each(function(){
  var imgClass = (this.width/this.height > 1) ? 'wide' : 'tall';
  $(this).addClass(imgClass);
 })
})


$(document).on('click', '#add-thought', function(evt) {
    evt.preventDefault();
  var message = document.getElementById('thought-message').value;
  $('#thought-message').val('');
  var id = $("input[name=occasionId]").val();
  var name = $("input[name=userName]").val();
  var photo = $("input[name=profilePicture]").val();
  //var isPublic = document.getElementById().value;
  $.post('/occasions/'+id+"/thoughts", 
    {message: message, 
      photo:"",
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
    });
  });

  $(document).on('click', '.delete-thought', function(evt) {
    evt.preventDefault();
    console.log("Delete thought")
    var occasion_id = $("input[name=occasionId]").val();
    var thought_id = $(this).parent().parent().attr('id');
    console.log("thought Id", thought_id);
    
    $.ajax({
      url: '/occasions/'+occasion_id+'/thoughts/'+thought_id,
      type: 'DELETE',
      success: function(result) {
        $('#'+thought_id).remove();
    }
  });

});

  $(document).on('click', '.edit-thought', function(evt) {
    evt.preventDefault();
    console.log("edit thought")
    var occasion_id = $("input[name=occasionId]").val();
    console.log(occasion_id);
    var modal = document.getElementById('editThoughtModal');
  //console.log(modal);
    $.get(
    '/occasions/'+ occasion_id,
    helpers.getFormData(modal)
  ).done(function(response) {
    $('#editThoughtModal').modal('show')
  }).fail(function(responseObject) {
    var response = $.parseJSON(responseObject.responseText);
    $('.error').text(response.err);
  });
  
});
