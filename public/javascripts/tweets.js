// Wrapped in an immediately invoked function expression.
(function() {
  $(document).on('click', '#submit-new-tweet', function(evt) {
    var content = $('#new-tweet-input').val();
    if (content.trim().length === 0) {
      alert('Input must not be empty');
      return;
    }
    $.post(
      '/tweets',
      { content: content }
    ).done(function(response) {
      loadHomePage();
      $('.error').text('');
    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    });
  });

  $(document).on('click', '.retweet', function(evt) {
    var item = $(this).parent();
    var id = item.data('tweet-id');
    var creator = item.data('creator');
    $.post(
      '/tweets',
      { content: item.children('.content').text(),
        retweetedFrom: creator }
    ).done(function(response) {
      loadHomePage();
      $('.error').text('');
    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    });
  });

  $(document).on('click', '.delete-tweet', function(evt) {
    var item = $(this).parent();
    var id = item.data('tweet-id');
    $.ajax({
      url: '/tweets/' + id,
      type: 'DELETE'
    }).done(function(response) {
      item.remove();
      $('.error').text('');
    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    });
  });
})();
