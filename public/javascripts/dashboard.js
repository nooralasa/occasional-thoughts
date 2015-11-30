$(function () {

  var friendData = []
  var addedFriends = [];

  $.get("/users/current",function (data) {
    var fbid = data.content.user.fbid;
    var token = data.content.user.token;
    $.get("https://graph.facebook.com/v2.5/me/friends?access_token="+token, function (obj, status){
    	console.log(obj.data);
    	friendData = obj.data;
      var friendNames = obj.data.map(function (friend) {
        return friend.name;
      });
      $('#share').autocomplete({
        source: friendNames,
        autoFocus: true
      });
    });
  });

  $('#share').keypress(function (e) {
    if(e.which == 13) {
      e.preventDefault();
      var input = $('#share').val();

      var result = $.grep(friendData, function (obj){ 
      	return obj.name === input; 
      });

      if (result.length === 1) {
      	addedFriends.push(result[0].id);
        $('#friends-div').append("<div><label>"+result[0].name+"</label></div>");
        $('#share').val('');
      } else {
      	alert('name error!');
      }
    }
  });

  $('form').submit(function (evt) {
    console.log("submit button pressed")
    evt.preventDefault();
    $.post('/occasions', {
      title: $('input[name=title]').val(),
      description: $('input[name=description]').val(),
      coverPhoto: $('input[name=coverPhoto]').val(),
      friends: addedFriends
    }).done(function () {
      window.location.replace('/occasions');
    }).fail(function () {
      alert('failed');
    });
  });

  $(document).on('click', '#upload', function(evt) {
    console.log("upload button clicked")
      var url = $('#url').val();
      console.log(url)
      $('#previewImg').attr('src', url);
  });
});

