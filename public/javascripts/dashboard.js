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
      var token = data.content.user.token;
      console.log(fbid);
      $.get("https://graph.facebook.com/v2.5/me/friends?access_token="+token, function(data, status){
        console.log("The call is being called");
        console.log(data);
    });
    })    
  });
});

$(function () {
  var friends = [];
  $.get("/users/current",function (data) {
    var fbid = data.content.user.fbid;
    var token = data.content.user.token;
    $.get("https://graph.facebook.com/v2.5/me/friends?access_token="+token, function(obj, status){
      obj.data.forEach(function (friend, friendIndex) {
        friends.push(friend.name);
      });
      console.log(friends);
      $('#share').autocomplete({
        source: friends,
        autoFocus:true
      });
    });
  });

  $('#share').keypress(function (e) {
    if(e.which == 13) {
      e.preventDefault();
      var input = $('#share').val();
      friends.forEach(function (friend) {
        if (input==friend) {
          $('#friends-div').append("<div><label>"+friend+"</label></div>");
          $('#share').val('');
          //do stuff
        }
      });
    }
  });
});


                      


