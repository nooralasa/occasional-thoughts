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
  $("#noorsBtn").click(function(){
    $.get("/users/current",function(data) {
      console.log(data);
      var fbid = data.content.user.fbid;
      console.log(fbid);
      $.get("https://graph.facebook.com/"+fbid+"/friends", function(data, status){
        console.log("The call is being called");
        //console.log(data);
    });
    })
    
  });
})
                      


