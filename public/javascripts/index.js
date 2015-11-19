$(document).ready(function () {
	console.log("Document is ready");
});


<<<<<<< HEAD
// $(document).on('click', '#register', function(evt) {
// 	console.log("got a response")
// 	window.location.replace("register")
// });

// $(document).on('click', '#show-all', function(evt) {
// 	evt.preventDefault();
// 	loadFeedPage();
// });


// $(document).on('click', '#show-follow', function(evt) {
// 	evt.preventDefault();
// 	loadFollowingPage();
// });

$(document).on('click', '#switch-view', function(evt) {
	evt.preventDefault();
	if (currentPageIsAll) {
		loadFollowingPage();
	} else {
		loadFeedPage();
	}
});

$(document).on('click', '#signin-btn', function(evt) {
	loadPage('signin');
	currentPageIsAll = true;
});

$(document).on('click', '#register-btn', function(evt) {
	loadPage('register');
});

// (function() {
//   $(document).on('click', '#register', function(evt) {
//   	loadPage('register')
//     // var content = $('#new-tweet-input').val();
//     // if (content.trim().length === 0) {
//     //   alert('Input must not be empty');
//     //   return;
//     // }
//     // $.post(
//     //   '/tweets',
//     //   { content: content }
//     // ).done(function(response) {
//     //   loadHomePage();
//     //   $('.error').text('');
//     // }).fail(function(responseObject) {
//     //   var response = $.parseJSON(responseObject.responseText);
//     //   $('.error').text(response.err);
//     // });
//   });
// })();


=======
$(document).on('click', '#register', function(evt) {
	console.log("register button clicked");
	$.get('/register', function (response) {
		console.log("response is ", response);
		console.log('Page loaded');
	});
});
>>>>>>> 1229bdf39bff50665f8ea5a91311dabc6f641526
