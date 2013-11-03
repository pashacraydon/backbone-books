
define(function (require) {
    var Backbone = require('backbone'),
      M = require('app/models/BookModel'),
      BookCollection;

  BookCollection = Backbone.Collection.extend({
        model: M.BookModel
    });

  return {
      BookCollection: BookCollection
  };
});