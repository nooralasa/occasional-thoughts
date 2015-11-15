// Wrap in an immediately invoked function expression.
(function() {
  $(document).on('submit', '#signin-form', function(evt) {
    evt.preventDefault();
    $.post(
      '/users/login',
      helpers.getFormData(this)
    ).done(function(response) {
      currentUser = response.content.user;
      loadHomePage();
    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    });
  });

  $(document).on('submit', '#register-form', function(evt) {
    evt.preventDefault();
    var formData = helpers.getFormData(this);
    if (formData.password !== formData.confirm) {
      $('.error').text('Password and confirmation do not match!');
      return;
    }
    delete formData['confirm'];
    $.post(
      '/users',
      formData
    ).done(function(response) {
      loadHomePage();
    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    });
  });

  $(document).on('click', '#logout-link', function(evt) {
    evt.preventDefault();
    $.post(
      '/users/logout'
    ).done(function(response) {
      currentUser = undefined;
      loadHomePage();
    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    });
  });

  $(document).on('click', '#submit-new-follow', function(evt) {
    var content = $('#new-follow-input').val();
    if (content.trim().length === 0) {
      alert('Input must not be empty');
      return;
    }
    // $('#new-follow-input').val('');
    $.post(
      '/users/follow',
      { content: content }
    ).done(function(response) {
      loadHomePage();
      $('.error').text('');
    }).fail(function(responseObject) {
      var response = $.parseJSON(responseObject.responseText);
      $('.error').text(response.err);
    });
  });
})();
