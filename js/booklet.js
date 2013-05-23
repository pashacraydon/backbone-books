(function($) {

 // var api_key = 'AIzaSyBhBph_ccmIlFn9YSrvhCE_8zrYxazyqJ8';
    var api_key = 'AIzaSyAUpierWu7ydjKsa2141jS55CCnqu7JXZo';
  //  var api_key = 'AIzaSyB4ro-tnpGwr6WXHs3_wBF3hKFnXQv8pfo';

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
                    "smallThumbnail": "",
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
      el: $("#search_form"),
      
      initialize: function() {
           // $('#books').jcarousel();
      },
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
            data: 'q='+query+'&maxResults=8&key='+api_key+'&fields=totalItems,items(id,accessInfo, selfLink,volumeInfo)',
            dataType: 'jsonp',
            success: function(data) {
              for(var i in data.items) {
                data.items[i].volumeInfo = data.items[i].volumeInfo || {}; //Fix object 'undefined' error if there is a missing field
                data.items[i].volumeInfo.imageLinks = data.items[i].volumeInfo.imageLinks || {};  
                data.items[i].volumeInfo.title = data.items[i].volumeInfo.title.length > 30 ? data.items[i].volumeInfo.title.substr(0,30) + '...' : data.items[i].volumeInfo.title;
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
              url = 'https://www.googleapis.com/books/v1/volumes?q='+query+'&maxResults=5&key='+api_key+'&fields=totalItems,items(accessInfo,volumeInfo)';
              $.getJSON(url + '&callback=?', function(data) {
                 var dropdown = [];
                 for(var i in data.items) {
                    var subtitle = typeof data.items[i].volumeInfo.subtitle != "undefined" ? ': '+data.items[i].volumeInfo.subtitle : '';
                    var ele = {};
                    ele = data.items[i].volumeInfo.title+subtitle; //Create array of objects autocomplete can parse
                    dropdown.push(ele);
                   // console.log(data.items[i].volumeInfo);
                  }
                 response(dropdown);
                 console.log(dropdown);
              });
            },
            focus: function( event, ui ) {
                var search = new SearchView();
                search.browse(ui.item.value);
                //console.log(ui.item.value);
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


  /* Some browse pages */
  var AppRouter = Backbone.Router.extend({
    routes: {
        "": "index",  //Landing page
        "browse/:query": "browse", // #browse/php
        "browse/subject/:query": "subject",
        "browse/publisher/:query": "publisher"
    },
    index: function() {
      var search = new SearchView();
      //search.browse('python');
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