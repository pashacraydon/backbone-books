
define(function (require) {
  var Backbone = require('backbone'),
    ls = require('localstorage'),
    BookModel = require('app/models/BookModel'),
    myLibrary;

  myLibrary = Backbone.Collection.extend({
  	model: BookModel,
  	localStorage: new Backbone.LocalStorage("myBooks")
  });

  return myLibrary;
});