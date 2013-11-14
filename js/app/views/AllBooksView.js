define(function (require) {
    var _ = require('underscore'),
      $ = require('jquery'),
      BookView = require('app/views/BookView'),
      Backbone = require('backbone'),
      AllBooksView;

  AllBooksView = Backbone.View.extend({

    //all books go inside an unordered list tag
    tagName: "ul",

    initialize: function() {
      //bind 'this' object to book method
      _.bindAll(this, "book");
    },

    render: function() {
      //call the book method on each book in this collection
      this.collection.each(this.book); 
    },

    topic: function (topic, maxResults) {
      //for frontpage topics, prepend a title and append a 'more' button
      this.$el.prepend('<h1>'+topic+'</h1>').append('<a href="#browse/subject/'+topic+'/'+maxResults+'">More &raquo;</a>');
    },

    book: function(model) {
      //Instantiate a book view and populate it with a model, 
      //then render it and append it to this views html element
      var bookItem = new BookView({ model: model });
      bookItem.render();
      this.$el.append(bookItem.el);
    }
  });

  return AllBooksView;
});