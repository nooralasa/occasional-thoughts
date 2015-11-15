// See handlebarsjs.com for details. Here, we register
// a re-usable fragment of HTML called a "partial" which
// may be inserted somewhere in the DOM using a function
// call instead of manual insertion of an HTML String.
Handlebars.registerPartial('tweet', Handlebars.templates['tweet']);

// Global variable set when a user is logged in. Note
// that this is unsafe on its own to determine this: we 
// must still verify every server request. This is just 
// for convenience across all client-side code.
currentUser = undefined;

currentPageIsAll = true;

// A few global convenience methods for rendering HTML
// on the client. Note that the loadPage methods below
// fills the main container div with some specified 
// template based on the relevant action.

var loadPage = function (template, data) {
	data = data || {};
	$('#main-container').html(Handlebars.templates[template](data));
};

var loadHomePage = function () {
	if (currentUser) {
		if (currentPageIsAll) {
			loadFeedPage();
		} else {
			loadFollowingPage();
		}
	} else {
		loadPage('index');
	}
};

var loadFeedPage = function () {
	$.get('/tweets', function(response) {
		loadPage('tweets', { tweets: response.content.tweets, currentUser: currentUser });
		$('#show-follow').show();
		$('#show-all').hide();
		$('#title').text('All Tweets');
		$('#switch-view').text('Show Tweets of People You Are Following');
		currentPageIsAll = true;
	});
};

var loadFollowingPage = function () {
	$.get('/follow', function (response) {
		loadPage('tweets', { tweets: response.content.tweets, currentUser: currentUser });
		$('#show-follow').hide();
		$('#show-all').show();
		$('#title').text('Tweets of People You Are Following');
		$('#switch-view').text('Show All Tweets');
		currentPageIsAll = false;
	});
};

$(document).ready(function () {
	$.get('/users/current', function (response) {
		if (response.content.loggedIn) {
			currentUser = response.content.user;
		}
		loadHomePage();
	});
});

$(document).on('click', '#home-link', function(evt) {
	evt.preventDefault();
	loadHomePage();
});

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

