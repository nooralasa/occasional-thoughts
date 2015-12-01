$(function () {

  var friendData = []
  var addedFriends = [];
  var currentUser;

  $.get("/users/current", function (userData) {
    if (!userData.success) {
      console.log('failed in getting user data');
      alert('failed in getting user data');
    } else {
      currentUser = userData.content.user;
      console.log(currentUser);
      $.get("https://graph.facebook.com/v2.5/me/friends", 
            { access_token: currentUser.token }, 
            function (fbFriends, status){
            	console.log(fbFriends.data);
            	friendData = fbFriends.data;
              var friendNames = fbFriends.data.map(function (friend) {
                return friend.name;
              });
              $('#share').autocomplete({
                source: friendNames,
                autoFocus: true
              });
            }
      );
    }
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

  $('#angus-notif').click(function (evt) {
    console.log('here');    
    $.post("https://graph.facebook.com/v2.5/"+currentUser.fbid+"/notifications", 
            { access_token: currentUser.token, template: "hi", href: "http://localhost:3000" }, 
            function (data, status){
              console.log(data);
              console.log(status);
            }
    );
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
        $.get("/users/current",function (data) {
          var occasionId = data.content.user.createdOccasions[data.content.user.createdOccasions.length-1];
          console.log(occasionId);

          //TODO: fix array passing into messenger
          window.location.replace('http://www.facebook.com/dialog/send?app_id=929113373843865&to[]='
          +addedFriends[0]+'&to[]='+addedFriends[1]
          +'&link=https://occasionalthoughts.herokuapp.com/occasions/'+occasionId
          +'&redirect_uri=http://occasionalthoughts.herokuapp.com/occasions');
        });
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

  $(function() {
    $("[name=toggler]").click(function(){
            $('.toHide').hide();
            $("#blk-"+$(this).val()).show('slow');
    });
 });

  $(function() {
    $("#emailBtn").click(function(){
            $('.email').hide(50);
            $("#emailSent").show(50);

    });
 });

  $(function() {
    $("#inviteFriends").click(function(){
            $('#emailSent').hide(50);
            $(".email").show(50);

    });
 });

});

