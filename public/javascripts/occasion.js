
$(window).load(function(){
 $('.coverContainer').find('img').each(function(){
  var imgClass = (this.width/this.height > 1) ? 'wide' : 'tall';
  $(this).addClass(imgClass);
 })
})


$(document).on('click', '#add-thought', function(evt) {
	var message = document.getElementById('thought-message').value;
	var id = $("input[name=occasionId]").val();
	//var photo = document.getElementById().value;
	//var isPublic = document.getElementById().value;
	$.post('/occasions/'+id+"/thoughts", 
		{message: message, 
			photo: "http://cdn.toonvectors.com/images/40/14323/toonvectors-14323-140.jpg",
			isPublic: true}
		).done(function(response) {
          console.log("ajax req sent" );
     	     
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });
