$(function () {

  var friendData = [];
  var addedFriends = [];
  var participantsList = [];
  var recipientsList = [];
  var currentUser;

  $.get("/users/current", function (userData) {
    if (!userData.success) {
      alert('failed in getting user data');
    } else {
      currentUser = userData.content.user;
      $.get("https://graph.facebook.com/v2.5/me/friends", 
            { access_token: currentUser.token }, 
            function (fbFriends, status){
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

      var result = $.grep(friendData, function (obj){ 
      	return obj.name === input; 
      });

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

  $('#finish').click(function (evt) {
    var partCheckedButton = $('input[name=toggler]:checked').val();
    var recCheckedButton = $('input[name=Rtoggler]:checked').val();

    var datetime = Date.parse($('#pubDate').val() + ' ' + $('#pubTime').val());
    //create the occasion
    $.post('/occasions', {
      title: $('input[name=title]').val(),
      description: $('#description').val(),
      coverPhoto: $('input[name=coverPhoto]').val(),
      participants: participantsList,
      recipients: recipientsList,
      publishTime: datetime,
      participantIsPublic: partCheckedButton==1,
      recipientIsPublic: recCheckedButton==1
    }).done(function () {
      $.get("/users/current",function (data) {
        var occasionId = data.content.user.createdOccasions[data.content.user.createdOccasions.length-1];
        //ToDo: edit to specific occasion
        $('#copy-link').val('http://occasionalthoughts.herokuapp.com/occasions/'+occasionId);
      }); 
    }).fail(function () {
      alert('failed yo');
    });

    // if($('[id="tgl1"]').is(':checked')) {
      // if(document.getElementById("tgl1").checked){
    if(partCheckedButton==1){
      $("#blk-1").show(50);
    }

    if(partCheckedButton==2){

      $("#blk-3").show(50);
      $("#done").show(50);
    }
    
  });

  $('#fb-share').click(function (evt) {
    $.get("/users/current",function (data) {
      var occasionId = data.content.user.createdOccasions[data.content.user.createdOccasions.length-1];

      console.log('http://occasionalthoughts.herokuapp.com/occasions/'+occasionId);
      window.location.replace('http://www.facebook.com/dialog/send?'
        +'app_id=929113373843865'
        +'&link=http://occasionalthoughts.herokuapp.com/occasions/'+occasionId
        +'&redirect_uri=https://occasionalthoughts.herokuapp.com/');
    });
  });

  $('form').submit(function (evt) {
    window.location.replace('/occasions');
  });

  $(document).on('click', '#upload', function(evt) {
      var url = $('#url').val();
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

