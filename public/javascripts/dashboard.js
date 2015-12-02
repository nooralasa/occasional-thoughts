$(function () {

  var friendData = [];
  var addedFriends = [];
  var fakeAddedFriends = ["10153460608834877", "10207615671607073", "966588576732829"];
  var addedFriendsEmails = [];
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

  $('#recipientShare').keypress(function (e) {
    if(e.which == 13) {
      e.preventDefault();
      var input = $('#recipientShare').val();

      var result = $.grep(friendData, function (obj){ 
        return obj.name === input; 
      });

      if (result.length === 1) {
        addedFriends.push(result[0].id);
        $('#recipients').append("<div><label>"+result[0].name+"</label></div>");
        $('#recipientShare').val('');
      } else {
        alert('name error!');
      }
    }
  });

  $('#angus-notif').click(function (evt) {
    fakeAddedFriends.forEach(function(friendFbid) {
      User.findByFbid(friendFbid, function (err, user) {
        if (err)
          done(err);
        if (user) {
          addedFriendsEmails.push(user.email);
          done(null);
        } else {
          done(null);
        }
      });
    });

    console.log(addedFriendsEmails);

    // console.log('here');    
    // $.post("https://graph.facebook.com/v2.5/"+currentUser.fbid+"/notifications", 
    //         { access_token: currentUser.token, template: "hi", href: "http://localhost:3000" }, 
    //         function (data, status){
    //           console.log(data);
    //           console.log(status);
    //         }
    // );
  });

  $('#finish').click(function (evt) {

    // if($('[id="tgl1"]').is(':checked')) {
      // if(document.getElementById("tgl1").checked){
      console.log("USMAN: ", $('input[name=toggler]:checked').val())
      checkedButton = $('input[name=toggler]:checked').val()
      console.log("CheckedButton: ", checkedButton)
      if(checkedButton===1){

        console.log("inside the if condition")
        $("#previous").hide(50);
        $("#finish").hide(50);
        $("#privacyForm").hide(50);

        $("#blk-1").show(50);
        $("#done").show(50);
    }
    
    console.log("finish button pressed");
    evt.preventDefault();
    $.post('/occasions', {
      title: $('input[name=title]').val(),
      description: $('input[name=description]').val(),
      coverPhoto: $('input[name=coverPhoto]').val(),
    }).done(function () {
      console.log('done');
      $.get("/users/current",function (data) {
        var occasionId = data.content.user.createdOccasions[data.content.user.createdOccasions.length-1];
        console.log(occasionId);
        $('#copy-link').val('http://occasionalthoughts.herokuapp.com/occasions/'+occasionId);
      });

      //window.location.replace('/occasions');
    }).fail(function () {
      alert('failed');
    });
  });

  $('#fb-share').click(function (evt) {
    console.log('fb-share pressed');
    $.get("/users/current",function (data) {
      var occasionId = data.content.user.createdOccasions[data.content.user.createdOccasions.length-1];
      console.log(occasionId);

      window.location.replace('http://www.facebook.com/dialog/send?app_id=929113373843865'
      +'&link=http://occasionalthoughts.herokuapp.com/occasions/'+occasionId
      +'&redirect_uri=http://occasionalthoughts.herokuapp.com/occasions');
    });
  });

  $('form').submit(function (evt) {
    console.log("submit button pressed");
    window.location.replace('/occasions');
  });

  $(document).on('click', '#upload', function(evt) {
    console.log("upload button clicked")
      var url = $('#url').val();
      console.log(url)
      $('#previewImg').attr('src', url);
  });

  $("#tgl2").click(function(){
          $('.toHide').hide();
          $("#blk-2").show('fast');
          $("#finish").show();
  });

  $("#tgl1").click(function(){
          $('.toHide').hide();
          $("#finish").show();
  });

  $("#done").click(function(){
          $('#createOccasionModal').modal('hide');
  });

  $("#emailBtn").click(function(){
          $('.email').hide(50);
          $("#emailSent").show(50);

  });

  $("#inviteFriends").click(function(){
          $('#emailSent').hide(50);
          $(".email").show(50);

  });

  $("#upload").click(function(){
        if($('#url').val()!=""){
          $("#preview").show(50);
        }
          

  });

});

