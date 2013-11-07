
define(function (require) {
  var Backbone = require('backbone'),
    ls = require('localstorage'),
    M = require('app/models/BookModel'),
    myLibrary;

  myLibrary = Backbone.Collection.extend({
  	model: M.BookModel,
  	localStorage: new Backbone.LocalStorage("myBooks")
  });

  return new myLibrary;
});