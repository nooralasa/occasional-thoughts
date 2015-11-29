
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
	//var photo = document.getElementById().value;
	//var isPublic = document.getElementById().value;
	$.post('/occasions/'+id+"/thoughts", 
		{message: message, 
			photo: "http://cdn.toonvectors.com/images/40/14323/toonvectors-14323-140.jpg",
			isPublic: true}
		).done(function(response) {
          $('#thought-list').append( 
          	'<div class= "thought"> <li ><img src="http://cdn.toonvectors.com/images/40/14323/toonvectors-14323-140.jpg"><h3 align="left">'
          	+ name +'</h3><p align= "left" >'+ message +'</p></li></div>'
          	);
     	     
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });
