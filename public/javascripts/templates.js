(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['index'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"homepage\">\r\n  <h1>Fritter</h1>\r\n  <p>You must be signed in to continue.</p>\r\n  <button id=\"signin-btn\">Sign in</button>\r\n  <button id=\"register-btn\">Register</button>\r\n</div>\r\n";
},"useData":true});
templates['register'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "      "
    + container.escapeExpression(((helper = (helper = helpers.error || (depth0 != null ? depth0.error : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"error","hash":{},"data":data}) : helper)))
    + "\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div id=\"register\">\r\n  <a href=\"#\" id=\"home-link\">Back to Home</a>\r\n  <h1>Register</h1>\r\n  <div class=\"error\">\r\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.error : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\r\n  <form id=\"register-form\">\r\n    <div>Username: <input type=\"text\" name=\"username\" required /></div>\r\n    <div>Password: <input type=\"password\" name=\"password\" required /></div>\r\n    <div>Confirm Password: <input type=\"password\" name=\"confirm\" required /></div>\r\n    <input type=\"submit\" />\r\n  </form>\r\n</div>\r\n";
},"useData":true});
templates['signin'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "      "
    + container.escapeExpression(((helper = (helper = helpers.error || (depth0 != null ? depth0.error : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"error","hash":{},"data":data}) : helper)))
    + "\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div id=\"signin\">\r\n  <a href=\"#\" id=\"home-link\">Back to Home</a>\r\n  <h1>Sign in</h1>\r\n  <div class=\"error\">\r\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.error : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\r\n  <form id=\"signin-form\">\r\n    <div>Username: <input type=\"text\" name=\"username\" required /></div>\r\n    <div>Password: <input type=\"password\" name=\"password\" required /></div>\r\n    <input type=\"submit\" />\r\n  </form>\r\n</div>\r\n";
},"useData":true});
templates['tweet'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "    : Retweeted from "
    + container.escapeExpression(((helper = (helper = helpers.retweet || (depth0 != null ? depth0.retweet : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"retweet","hash":{},"data":data}) : helper)))
    + "\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "    <a href=\"#\" class=\"delete-tweet\">Delete</a>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "\r\n<div class=\"tweet\" data-tweet-id="
    + alias4(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"_id","hash":{},"data":data}) : helper)))
    + " data-creator=\""
    + alias4(((helper = (helper = helpers.creatorId || (depth0 != null ? depth0.creatorId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"creatorId","hash":{},"data":data}) : helper)))
    + "\">\r\n  <p class=\"content\">"
    + alias4(((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"content","hash":{},"data":data}) : helper)))
    + "</p>\r\n  <p>Tweeted by "
    + alias4(((helper = (helper = helpers.creator || (depth0 != null ? depth0.creator : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"creator","hash":{},"data":data}) : helper)))
    + " at "
    + alias4(((helper = (helper = helpers.timeString || (depth0 != null ? depth0.timeString : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"timeString","hash":{},"data":data}) : helper)))
    + "\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.retweet : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </p>\r\n  <a href=\"#\" class=\"retweet\">Retweet</a>\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.userIsCreator : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\r\n";
},"useData":true});
templates['tweets'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.tweet,depth0,{"name":"tweet","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    return "    <p><em>No notes yet!</em></p>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<div id=\"tweets\">\r\n\r\n  <p>Welcome, "
    + container.escapeExpression(((helper = (helper = helpers.currentUser || (depth0 != null ? depth0.currentUser : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"currentUser","hash":{},"data":data}) : helper)))
    + " (<a href=\"#\" id=\"logout-link\">logout</a>)</p>\r\n  <div class=\"error\"></div>\r\n\r\n  <p><a id=\"switch-view\" href=\"#\">Show Tweets of People You Are Following</a></p>\r\n  \r\n  <div>\r\n    <label for=\"new-follow-input\">Enter a username to follow:</label>\r\n    <input type=\"text\" id=\"new-follow-input\" />\r\n    <button id=\"submit-new-follow\">Follow</button>\r\n  </div>\r\n\r\n  <div>\r\n    <label for=\"new-tweet-input\">Add a new tweet:</label>\r\n    <input type=\"text\" id=\"new-tweet-input\" />\r\n    <button id=\"submit-new-tweet\">Add</button>\r\n  </div>\r\n\r\n  <h1 id=\"title\">All Tweets</h1>\r\n\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.tweets : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "\r\n</div>\r\n";
},"usePartial":true,"useData":true});
})();