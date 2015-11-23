$(function () {
  $('form').submit(function (evt) {
    evt.preventDefault();
    $.post('/occasions', {
      title: $('input[name=title]').val(),
      description: $('input[name=description]').val(),
      coverPhoto: $('input[name=coverPhoto]').val()
    }).done(function () {
      window.location.replace('/occasions');
    }).fail(function () {
      alert('failed');
    });
  });
});


$(function () {
  $("noorsBtn").click(function(){
    
    $("noorsBtn").get("https://graph.facebook.com/USER_ID/invitable_friends", function(data, status){
        console.log("The call is being called");
    });
  });
})
                      


