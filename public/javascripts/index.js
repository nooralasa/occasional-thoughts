$(document).ready(function () {
	console.log("Document is ready");
});


$(document).on('click', '#register', function(evt) {
	console.log("register button clicked");
	$.get('/register', function (response) {
		console.log("response is ", response);
		console.log('Page loaded');
	});
});