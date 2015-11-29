$(function () {

  var friendData = []
  var addedFriends = [];

  $.get("/users/current",function (data) {
    console.log(data);
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
    evt.preventDefault();
    console.log(addedFriends);
    $.post('/occasions', {
      title: $('input[name=title]').val(),
      description: $('input[name=description]').val(),
      coverPhoto: $('input[name=coverPhoto]').val(),
      friends: addedFriends
    }).done(function () {
      // $.get('http://www.facebook.com/dialog/send?app_id=929113373843865'
      //   +'&link=http://www.nytimes.com/interactive/2015/04/15/travel/europe-favorite-streets.html'
      //   +'&redirect_uri=http://localhost:3000/occasions')
      //   .done(function () {
      //     console.log('here');
      //   })
      //   .fail(function () {
      //     console.log('x failed');
      //   });
      console.log(addedFriends);
      window.location.replace('http://www.facebook.com/dialog/send?app_id=929113373843865&to='
        +addedFriends
        +'&link=https://occasionalthoughts.herokuapp.com/'
        +'&redirect_uri=http://localhost:3000/occasions');
    }).fail(function () {
      alert('failed');
    });
  });

  $(document).on('click', '#upload', function(evt) {
    console.log("upload button clicked")
      var url = $('#url').val();
      $('#previewImg').attr('src', url);
  });
});

