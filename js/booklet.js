(function($) {

  var api_key = 'AIzaSyBhBph_ccmIlFn9YSrvhCE_8zrYxazyqJ8';
  var num_books = 2;
   // var api_key = 'AIzaSyAUpierWu7ydjKsa2141jS55CCnqu7JXZo';
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
                    "thumbnail": ""
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
      el: $("#search_form"),  //Bind this view to the search form
      
      initialize: function() {
           // $('#books').jcarousel();
      },
      search: function( e ){
        e.preventDefault();  //Prevent default behavior
        $('#books').html(''); //Remove previous search
        this.ajax( $('#search_input').val(), index='0'); //Do a search with the form input as the query
      },
      browse: function( query ){
        $('#books').html(''); //Remove previous search
        this.ajax(query, index="0");  //Do a search with query passed in from a function
      },
      ajax: function( query, index ) {
          //Query the Google Books API and return json
          $.ajax({
           url: 'https://www.googleapis.com/books/v1/volumes?',
            data: 'q='+encodeURIComponent(query)+'&startIndex='+index+'&maxResults='+num_books+'&key='+api_key+'&fields=totalItems,items(id,accessInfo, selfLink,volumeInfo)',
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
          this.morebutton(query, index);
      },
      autocomplete: function( e ) {
        var query = $('#search_input').val();
        $( "#search_input" ).autocomplete({
            source: function( request, response ) {
              url = 'https://www.googleapis.com/books/v1/volumes?q='+encodeURIComponent(query)+'&maxResults=4&key='+api_key+'&fields=totalItems,items(accessInfo,volumeInfo)';
              $.getJSON(url + '&callback=?', function(data) {
                 var dropdown = [];
                 for(var i in data.items) {
                    var subtitle = typeof data.items[i].volumeInfo.subtitle != "undefined" ? ': '+data.items[i].volumeInfo.subtitle : '';
                    var ele = {};
                    ele = data.items[i].volumeInfo.title+subtitle; //Create array of object attributes autocomplete can parse
                    dropdown.push(ele);
                   // console.log(data.items[i].volumeInfo);
                  }
                 response(dropdown);
                 console.log(dropdown);
              });
            },
            focus: function( event, ui ) {
                var search = new SearchView();
                search.browse(ui.item.value, '0');
                //console.log(ui.item.value);
            }
        });
      },
      morebutton: function( query, index ) {
         $('.wrap-btn').remove();
         var countIndex = parseInt(index) + parseInt(num_books);
         var morebtn = '<div class="wrap-btn" style="text-align: center;"><a class="btn btn-large btn-info more-button" href="#scroll/'+encodeURIComponent(query)+'/'+countIndex+'">Show More</a></div>';
         $('#main').append(morebtn);
      },
      morebooks: function( query, index ) {
         this.ajax(query, index);
      },
      events: {
        "submit": "search", //Initiate search function, when the form with id #search_form (el) is submitted
        "keyup": "autocomplete"
      }
  });


  var BookView = Backbone.View.extend({
    render: function() {
      var book = _.template( $("#books_template").html(), this.model.toJSON());
      $("#books").append(book);
      $(".book").fadeIn(200);
    }
  });

  /*
  http://lostechies.com/derickbailey/2011/10/11/backbone-js-getting-the-model-for-a-clicked-element/ */
 var BookDetailView = Backbone.View.extend({
    el: $("#books"), 

    initialize: function() {

    },
    render: function() {
      var detail = _.template( $("#detail_template").html(), this.model.toJSON());
      $("#book-details").append(detail);
    },
    detail: function() {
        var id = this.mode.get("id");
        alert(id);

        $.ajax({
          url: 'https://www.googleapis.com/books/v1/volumes/'+this.model.id,
          dataType: 'jsonp',
          data: 'fields=volumeInfo/imageLinks&key='+api_key,
          success: function (data) {
               console.log(data);
               var detail = new BookModel(data);
               var bookDetail = new BookDetailView({ model: detail });
               bookDetail.render();
          }
        }); 
     },
     events: {
        'click li': 'detail'
     }
  });

  /* Some browse pages */
  var AppRouter = Backbone.Router.extend({
    routes: {
        "": "index",  //Landing page
        "browse/:query": "browse", // #browse/php
        "browse/subject/:query": "subject",
        "browse/publisher/:query": "publisher",
        "scroll/:query/:id": "scroll"
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
    },
    scroll: function( query, id ) {
      var search = new SearchView();
      search.morebooks(query, id);
    }
  });

  var app = new AppRouter();

  Backbone.history.start(); 

    $(document).ready(function() {
      });


})(jQuery);