(function($) {

  var api_key = 'AIzaSyBhBph_ccmIlFn9YSrvhCE_8zrYxazyqJ8';

  /* Initiate a Book Model */
  window.BookModel = Backbone.Model.extend({
    //If JSON field is 'undefined', prevent ajax error by supplying null values with an empty string default
    defaults: {
        "description": "",
        "title": "",
        "id": "",
        "selfLink": "",
        "volumeInfo": [
           {
               "imageLinks": [
                  {
                    "thumbnail": "stuff"
                  }
               ]
           }
        ]
    }
  });

  /* Initiate a Collection of Book Models */
  window.BookCollections = Backbone.Collection.extend({
        model: BookModel
    });

  /* Search the API */
  var SearchView = Backbone.View.extend({
      el: $("#search_input"),

      search: function( e ){
        e.preventDefault();  //Prevent default behavior
        this.ajax( $('#search_input').val() ); //Do a search with the form input as the query
      },
      browse: function( query ){
        this.ajax( query );  //Do a search with query passed in from a function
      },
      ajax: function( query ) {
          $('#books').html(''); //Remove previous search

          //Query the Google Books API and return json
          $.ajax({
           url: 'https://www.googleapis.com/books/v1/volumes?',
            data: 'q='+query+'&maxResults=40&key='+api_key+'&fields=totalItems,items(id,accessInfo, selfLink,volumeInfo)',
            dataType: 'jsonp',
            success: function(data) {
              for(var i in data.items) {
                var book = new BookModel(data.items[i]);
                console.log(data.items[i]);
                var bookView = new BookView({ model: book });
                bookView.render();
              }
            }
        });
      },
      autocomplete: function( e ) {
        var query = $('#search_input').val();
        $( "#search_input" ).autocomplete({
            source: function( request, response ) {
              url = 'https://www.googleapis.com/books/v1/volumes?q='+query+'&maxResults=10&key='+api_key+'&fields=totalItems,items(accessInfo,volumeInfo)';
              $.getJSON(url + '&callback=?', function(data) {
                 var dropdown = [];
                 for(var i in data.items) {
                    var ele = {};
                    ele = '<img src='+data.items[i].volumeInfo.imageLinks.smallThumbnail+' /> '+data.items[i].volumeInfo.title;
                    dropdown.push(ele);
                   // console.log(data.items[i].volumeInfo);
                  }
                 response(dropdown);
                 console.log(dropdown);
              });
            }
        });
      },
      events: {
        "submit": "search", //Initiate search function, when the form with id #search_form (el) is submitted
        "keyup": "autocomplete"
      }
  });

  /* Render the API with underscore.js templating */
  var BookView = Backbone.View.extend({
    render: function() {
      var book = _.template( $("#books_template").html(), this.model.toJSON());
      $("#books").append(book);
    }
  });

  /* Some pages */
  var AppRouter = Backbone.Router.extend({
    routes: {
        "": "index",  //Landing page
        "browse/:query": "browse", // #browse/php
        "browse/subject/:query": "subject",
        "browse/publisher/:query": "publisher"
    },
    index: function() {
      var search = new SearchView();
      search.browse('python');
    },
    browse: function( query ) {
      var search = new SearchView();
      search.browse(query);
    },
    subject: function( query ) {
      var search = new SearchView();
      search.browse('+subject:'+query);
    },
    publisher: function( query ) {
      var search = new SearchView();
      search.browse('+inpublisher:'+query);
    }
  });

  var app = new AppRouter();

  Backbone.history.start(); 

    $(document).ready(function() {
  });


})(jQuery);