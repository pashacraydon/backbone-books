(function($) {

  var api_key = 'AIzaSyBhBph_ccmIlFn9YSrvhCE_8zrYxazyqJ8';
  var num_books = 2;
   // var api_key = 'AIzaSyAUpierWu7ydjKsa2141jS55CCnqu7JXZo';
  //  var api_key = 'AIzaSyB4ro-tnpGwr6WXHs3_wBF3hKFnXQv8pfo';

  /* Initiate a Book Model */
  var BookModel = Backbone.Model.extend({
    //If JSON field is 'undefined', prevent ajax error by supplying null values with an empty string default
    defaults: {
        "id": "",
        "volumeInfo": [
           {
            "description": "",
            "title": "",
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

  var BookCollection = Backbone.Collection.extend({
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
        this.query( $('#search_input').val(), index='0'); //Do a search with the form input as the query
      },
      browse: function( term ){
        $('#books').html(''); //Remove previous search
        this.query(term, index="0");  //Do a search with query passed in from a function
      },
      query: function( term, index ) {
          //Query the Google Books API and return json
          $.ajax({
           url: 'https://www.googleapis.com/books/v1/volumes?',
            data: 'q='+encodeURIComponent(term)+'&startIndex='+index+'&maxResults='+num_books+'&key='+api_key+'&fields=totalItems,items(id,accessInfo, selfLink,volumeInfo)',
            dataType: 'jsonp',
            success: function(data) {

                var Books = new BookCollection();

                //Put JSON API into a model, into a collection
                for(var i in data.items) {
                    data.items[i].volumeInfo = data.items[i].volumeInfo || {}; //Define object
                    data.items[i].volumeInfo.imageLinks = data.items[i].volumeInfo.imageLinks || {};  
                   // data.items[i].volumeInfo.title = data.items[i].volumeInfo.title.length > 30 ? data.items[i].volumeInfo.title.substr(0,30) + '...' : data.items[i].volumeInfo.title;
                    var book = new BookModel(data.items[i]);
                    Books.add(book);
                }

               /* _.each(Books.models, function (item) {
                    console.log(item.toJSON());
                    var bookView = new BookView({ model: item });
                    bookView.render();
                }, this); */

                var item = new BookView({ collection: Books });
                item.render();
                $("#books").html(item.el);

              }
          });
          this.morebutton(term, index);
      },
      autocomplete: function( e ) {
        var term = $('#search_input').val();
        $( "#search_input" ).autocomplete({
            source: function( request, response ) {
              url = 'https://www.googleapis.com/books/v1/volumes?q='+encodeURIComponent(term)+'&maxResults=4&key='+api_key+'&fields=totalItems,items(accessInfo,volumeInfo)';
              $.getJSON(url + '&callback=?', function(data) {
                 var dropdown = [];
                 for(var i in data.items) {
                    var subtitle = typeof data.items[i].volumeInfo.subtitle != "undefined" ? ': '+data.items[i].volumeInfo.subtitle : '';
                    var ele = {};
                    ele = data.items[i].volumeInfo.title+subtitle; //Create array of object attributes autocomplete can parse
                    dropdown.push(ele);
                  }
                 dropdown = _.unique(dropdown);
                 response(dropdown);
              });
            },
            focus: function( event, ui ) {
                var search = new SearchView();
                search.browse(ui.item.value, '0');
                //console.log(ui.item.value);
            }
        });
      },
      morebutton: function( term, index ) {
         $('.wrap-btn').remove();
         var countIndex = parseInt(index) + parseInt(num_books);
         var morebtn = '<div class="wrap-btn" style="text-align: center;"><a class="btn btn-large btn-info more-button" href="#scroll/'+encodeURIComponent(term)+'/'+countIndex+'">Show More</a></div>';
         $('#main').append(morebtn);
      },
      morebooks: function( term, index ) {
         this.query(term, index);
      },
      events: {
        "submit": "search", //Initiate search function, when the form with id #search_form (el) is submitted
        "keyup": "autocomplete"
      }
  });


  var BookView = Backbone.View.extend({
    tagName: "ul",

    initialize: function(){
        _.bindAll(this, "detail");
    },
    render: function(){
     // console.log(this.collection.toJSON());
      this.collection.each(this.detail);
    },
    detail: function(model) {
      var bookDetail = new DetailView({model: model});
      bookDetail.render();
      $(this.el).append(bookDetail.el);
    }
  });


  var DetailView = Backbone.View.extend({
    tagName: "li",

    clicked: function(e){
       e.preventDefault();
       alert(this.model.id);
    },
    render: function(){
       var book = _.template( $("#books_template").html(), this.model.toJSON());
       $(this.el).append(book); 
       $(".book").fadeIn(200);
    },
    events: {
        "click": "clicked"
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
    browse: function( term ) {
      var search = new SearchView();
      search.browse(term);
    },
    subject: function( term ) {
      var search = new SearchView();
      search.browse('+subject:'+term);
    },
    publisher: function( term ) {
      var search = new SearchView();
      search.browse('+inpublisher:'+term);
    },
    scroll: function( term, id ) {
      var search = new SearchView();
      search.morebooks(term, id);
    }
  });

  var app = new AppRouter();

  Backbone.history.start(); 

    $(document).ready(function() {
      });


})(jQuery);