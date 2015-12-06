$(function () {

  var friendData = [];
  var addedFriends = [];
  var participantsList = [];
  var recipientsList = [];
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
              $('#participantShare').autocomplete({
                source: friendNames,
                autoFocus: true
              });
              $('#recipientShare').autocomplete({
                source: friendNames,
                autoFocus: true
              });
            }
      );
    }
  });

  $('#participantShare').keypress(function (e) {
    if(e.which == 13) {
      e.preventDefault();
      var input = $('#participantShare').val();

      console.log(friendData);
      var result = $.grep(friendData, function (obj){ 
      	return obj.name === input; 
      });

      console.log(result);
      if (result.length === 1) {
      	participantsList.push(result[0].id);
        $('#participants').append("<div><label>"+result[0].name+"</label></div>");
        $('#participantShare').val('');
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
        recipientsList.push(result[0].id);
        $('#recipients').append("<div><label>"+result[0].name+"</label></div>");
        $('#recipientShare').val('');
      } else {
        alert('name error!');
      }
    }
  });

  // $('#angus-notif').click(function (evt) {
  //   console.log("submit post request for specific friends");
  //   $.post('/occasions', {
  //     title: $('input[name=title]').val(),
  //     description: $('input[name=description]').val(),
  //     coverPhoto: $('input[name=coverPhoto]').val(),
  //     participants: addedFriends
  //   }).done(function () {
  //     console.log('done');
  //     $.get("/users/current",function (data) {
  //       var occasionId = data.content.user.createdOccasions[data.content.user.createdOccasions.length-1];
  //       console.log(occasionId);
  //       $('#copy-link').val('http://occasionalthoughts.herokuapp.com/occasions/'+occasionId);
  //     });

  //     //window.location.replace('/occasions');
  //   }).fail(function () {
  //     alert('failed');
  //   });


  //   // console.log('here');    
  //   // $.post("https://graph.facebook.com/v2.5/"+currentUser.fbid+"/notifications", 
  //   //         { access_token: currentUser.token, template: "hi", href: "http://localhost:3000" }, 
  //   //         function (data, status){
  //   //           console.log(data);
  //   //           console.log(status);
  //   //         }
  //   // );
  // });

  $('#finish').click(function (evt) {
    console.log("finish button pressed");
    var partCheckedButton = $('input[name=toggler]:checked').val();
    var recCheckedButton = $('input[name=Rtoggler]:checked').val();

    //check if public participants
      //check if public recipients
        //post with participants:["public"],recipients:["public"]
      //else private recipients
        //populate correct recipients list.
        //post with participants:["public"],recipients:List of recipients
    //else private participants
      //check if public recipients
        //post with participants: List of participants,recipients:["public"]
      //else private recipients
         //post with participants: List of participants,recipients:List of recipients

    //public pre-publishing
    if(partCheckedButton==1) {
        participantsList = ["966588576732829"];
    };

    //public post publishing
    if (recCheckedButton==1) {
      recipientsList = ["966588576732829"];
    };
    console.log('part: ', participantsList);

    var datetime = Date.parse($('#pubDate').val() + ' ' + $('#pubTime').val());
    console.log(recipientsList);
    //create the occasion
    $.post('/occasions', {
      title: $('input[name=title]').val(),
      description: $('#description').val(),
      coverPhoto: $('input[name=coverPhoto]').val(),
      participants: participantsList,
      recipients: recipientsList,
      publishTime: datetime,
      participantIsPublic: false,
      recipientIsPublic: false
    }).done(function () {
      console.log('done');
      console.log("I'm here here here here");
      $.get("/users/current",function (data) {
        var occasionId = data.content.user.createdOccasions[data.content.user.createdOccasions.length-1];
        console.log(occasionId);
        //ToDo: edit to specific occasion
        // $('#copy-link').val('http://occasionalthoughts.herokuapp.com/occasions/'+occasionId);
      }); 
    }).fail(function () {
      console.log("It failed miserably");
      alert('failed yo');
    });

    // if($('[id="tgl1"]').is(':checked')) {
      // if(document.getElementById("tgl1").checked){
    if(partCheckedButton==1){
      $("#previous").hide(10);
      $("#finish").hide(10);
      $("#privacyForm").hide(10);

      $("#blk-1").show(50);
      $("#done").show(50);
    }

    if(partCheckedButton==2){
      $("#previous").hide(10);
      $("#finish").hide(10);
      $("#blk-2").hide(10);
      $("#privacyForm").hide(10);

      $("#blk-3").show(50);
      $("#done").show(50);
    }
    
  });

  $('#fb-share').click(function (evt) {
    console.log('fb-share pressed');
    $.get("/users/current",function (data) {
      var occasionId = data.content.user.createdOccasions[data.content.user.createdOccasions.length-1];
      console.log(occasionId);

      window.location.replace('http://www.facebook.com/dialog/send?app_id=929113373843865'
      +'&link=http://occasionalthoughts.herokuapp.com/occasions/'
      +'&redirect_uri=http://occasionalthoughts.herokuapp.com/');
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
    $('#createOccasionModal').on('hidden.bs.modal', function(){
      $(this).find('form')[0].reset();
      window.location.replace('/');
    });
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

  $("#r2").click(function(){
          $(".specific").show("slow");
  });

  $("#r1").click(function(){
          $(".specific").hide("slow");
  });

});

