
define(function (require) {
    var Backbone = require('backbone'),
      R = require('app/routers/routes');

  //Get the party started
  var app = new R.AppRouter();
  // Start Backbone history for bookmarkable URL's
  Backbone.history.start(); 

});