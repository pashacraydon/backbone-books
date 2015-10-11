
define(function (require) {
  var Backbone = require('backbone'),
    BookModel = require('app/models/BookModel'),
    BookCollection;

  BookCollection = Backbone.Collection.extend({
    model: BookModel,
    parse: function (response) {
    	return response.items;
    }
  });

    return BookCollection;
});