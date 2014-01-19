define(function (require) {
    var _ = require('underscore'),
      $ = require('jquery'),
      Backbone = require('backbone'),
      DetailView = require('app/views/DetailView'),
      bookTemplate = require('text!app/templates/book.html'),
      BookView;

  require('modernizr');
  
  BookView = Backbone.View.extend({
    //each book is created inside an html list tag
    tagName: "li",

    //cache the template function for a single item
    template: _.template(bookTemplate),

    //the DOM events specific to this view
    events: {
      "click": "clicked"
    },

    initialize: function() {
      //bind 'this' object to render method
      _.bindAll(this, "render");
    },

    //when a book is clicked, 
    //call the detail method and pass in its model
    clicked: function(e){
      e.preventDefault();
      this.detail(this.model);
    },

    //populate the cached template and append to 'this' objects html
    render: function(){
      var book = _.template(this.template(this.model.toJSON()));
      this.$el.append(book);
    },

    detail: function(model) {
      //Instantiate the book details view with the book model that was clicked on
      var bookDetail = new DetailView({ el: $("#book-details"), model: model });
      bookDetail.render();
      bookDetail.undelegate('.close detail','click');  //todo: better garbage collection
    }
  });

  return BookView;
});