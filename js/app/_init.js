
define(function (require) {
    var Backbone = require('backbone'),
      R = require('app/routers/routes');

  //Get the party started
  var app = new R.AppRouter();
  Backbone.history.start(); 

});