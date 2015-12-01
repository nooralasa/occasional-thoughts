
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
  //"http://cdn.toonvectors.com/images/40/14323/toonvectors-14323-140.jpg"
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
    }).fail(function(responseObject) {
        var response = $.parseJSON(responseObject.responseText);
        $('.error').text(response.err);
    });
  });

  $(document).on('click', '#delete-thought', function(evt) {
    evt.preventDefault();
    console.log("Delete thought")
    var occasion_id = $("input[name=occasionId]").val();
    var thought_id = $("input[name=thoughtId]").val();
    console.log("thought Id", thought_id);
    
    $.ajax({
      url: '/occasions/'+occasion_id+'/thoughts/'+thought_id,
      type: 'DELETE',
      success: function(result) {
        $('#'+thought_id).remove();
    }
  });

});

  $(document).on('click', '#edit-thought', function(evt) {
    evt.preventDefault();
    console.log("edit thought")
  
  });
