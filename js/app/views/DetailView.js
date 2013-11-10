define(function (require) {
    var _ = require('underscore'),
      $ = require('jquery'),
      Backbone = require('backbone'),
      C = require('app/collections/BookCollection'),
      M = require('app/models/BookModel'),
      v = require('app/utils/variables'),
      myCollection = require('app/collections/myLibrary'),
      helpers = require('app/utils/helpers'),
      detailsTemplate = require('text!app/templates/details.html'),
      DetailView;


  DetailView = Backbone.View.extend({

    //attach this view to the following html id
    el: $("#book-details"),

    //DOM events for this view
    events: {
      "click .close-detail": "hide",
      "click #overlay": "hide",
      "click .save-book": "saveBook",
      "click .remove-book": "removeBook"
    },

    initialize: function() {
      /* Add a faded overlay */
      var overlay = '<div id="overlay" style="display: none;"></div>';
      this.$el.find('#overlay').remove(); //Remove previous overlay
      this.$el.append(overlay).find('#overlay').fadeIn('slow');

      /* css3 transforms are buggy with z-index, need to remove them under the overlay */
      this.$el.next().find('li').find('.book').addClass('removeTransform');

      /* Define JSON objects, this prevents ajax errors */
      this.model.attributes.description = this.model.attributes.description || {};
      this.model.attributes.volumeInfo = this.model.attributes.volumeInfo || {};
      this.model.attributes.volumeInfo.imageLinks = this.model.attributes.volumeInfo.imageLinks || {};
    },

    render: function() {
      var localExists = this.localBook(),
          self = this,
          $details = $("#book-details");

      //Remove previous instances of this template
      $details.find('#detail-view-template').remove();

      //If book is in localStorage, get it there
      if (localExists) {
          var localBook = myCollection;

          localBook.fetch({
            success:function() {
              var data = localBook.get(self.model.id),
                  book = data.toJSON();

              //localStorage booleans let details template know 
              //which button to show
              book['localstorage'] = true;
              book['localbook'] = true;

              view = _.template(detailsTemplate, book);
              $details.append(view).find('#detail-view-template').show().addClass('down');

              helpers.shortSynopsis();
            }
          });
      //Otherwise, do an API query
      } else {
          data = this.queryApi(this.model);

          data.done(function () {
              book = data.responseJSON;

              book['localstorage'] = Modernizr.localstorage;
              book['localbook'] = localExists;

              var detail = new M.BookModel(book);
                  //Load the books model into the details template
                  view = _.template(detailsTemplate, detail.toJSON());

              $details.append(view).find('#detail-view-template').show().addClass('down');

              helpers.shortSynopsis();
          });
      }
    },

    doAjax: function (url, data) {
      return $.ajax({
        dataType: 'jsonp',
        data: data,
        url: url
      });
    },

    queryApi: function(model) {
      var aj,
          url = 'https://www.googleapis.com/books/v1/volumes/'+this.model.id,
          data = 'fields=accessInfo,volumeInfo&key='+v.API_KEY,
          data;

      aj = this.doAjax(url, data);

      return aj;
    },

    //Checks the localstorage keys to see if the book is there,
    //returns boolean
    localBook: function() {
      var self = this,
          exists;

      _.each(Object.keys(localStorage), function(key,value) {
        if (key === 'myBooks-'+self.model.id) {
          exists = true;
        }
      });

      if (exists) {
        return true;
      }
    },

    removeBook: function(e) {
      e.preventDefault();

      //Remove the book from localStorage
      localStorage.removeItem('myBooks-'+this.model.id);

      //Make it a 'save' button instead
      e.currentTarget.className = 'btn save-book';
      e.currentTarget.textContent = '+ Save book to my library';
    },

    saveBook: function(e) {
      var self = this,
        welcomeMsg = $('.welcome').length;

      e.preventDefault();

      data = this.queryApi(this.model);

      data.done(function () {
        book = data.responseJSON;

        //Sets boolean values so template knows which button to show
        book['localstorage'] = Modernizr.localstorage;
        book['localbook'] = true;

        var newBook = new M.BookModel(book);

        //Unique model ID's are required for localStorage to work properly
        newBook.set({ id: self.model.id });

        var addBook = myCollection;

        addBook.fetch({
          success:function() {
            addBook.create(newBook);
            newBook.save();
          }
        });

        //Refresh local books if were in the 'mybooks' page
        //with welcome message present
        if (window.location.hash === '#mybooks' && welcomeMsg) {
          location.reload();
        }
      });

      //Now make it a 'remove' button instead
      e.currentTarget.className = 'btn remove-book';
      e.currentTarget.textContent = '- Remove book from my library';
    },

    hide: function(e) {
      var localExists = this.localBook();
      e.preventDefault();

      this.$el.find('#detail-view-template').removeClass('down').addClass('up');
      this.$el.find('#overlay').fadeOut('slow');
      this.$el.next().find('li').find('.book').removeClass('removeTransform');
      this.$el.undelegate(); // Todo: do better garbarge collection
      //Refresh local books if they've removed one
      if (window.location.hash === '#mybooks' && !localExists) {
        location.reload();
      }
    }
  });


  // public API
  return {
    DetailView: DetailView
  };

});