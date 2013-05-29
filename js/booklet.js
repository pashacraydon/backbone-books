(function($) {

  /* Please use your own API key, thanks! */
  var api_key = 'AIzaSyBhBph_ccmIlFn9YSrvhCE_8zrYxazyqJ8';
  var num_books = 18;
  var counter = 99999;

  /* Initiate a Book Model */
  var BookModel = Backbone.Model.extend({
    //If JSON field is 'undefined', prevent ajax error by supplying null values with an empty string default
    defaults: {
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

      initialize: _.once(function() {
         this.browse('a dance with dragons'); //Load initial titles just once
         $("#search_input").focus();
      }),
      search: function( e ){
        e.preventDefault();  
        $('#books').html(''); //Remove previous search
        this.query( $('#search_input').val(), index='0'); //Do a search with the form input as the query
      },
      browse: function( term ){
        $('#books').html(''); //Remove previous search
        this.query(term, index="0");  //Do a search with query passed in from a function
      },
      lastsearch: function( term ) {

      },
      query: function( term, index ) {

          //Query the Google Books API and return json
          $.ajax({
           url: 'https://www.googleapis.com/books/v1/volumes?',
            data: 'q='+encodeURIComponent(term)+'&startIndex='+index+'&maxResults='+num_books+'&key='+api_key+'&fields=totalItems,items(id,volumeInfo)',
            dataType: 'jsonp',
              success: function(data) {
                var Books = new BookCollection();

                  //Put JSON API into a model, into a collection
                  for(var i in data.items) {
                    data.items[i].volumeInfo = data.items[i].volumeInfo || {}; //Define object
                    data.items[i].volumeInfo.imageLinks = data.items[i].volumeInfo.imageLinks || {}; 
                    data.items[i].volumeInfo.imageLinks.thumbnail = data.items[i].volumeInfo.imageLinks.thumbnail || '';
                    if (data.items[i].volumeInfo.imageLinks.thumbnail) {
                        var book = new BookModel(data.items[i]);
                        Books.add(book);
                    }
                  }

                  /* _.each(Books.models, function (item) {
                    console.log(item.toJSON());
                    var bookView = new BookView({ model: item });
                    bookView.render();
                  }, this); */

                  var item = new AllBooksView({ collection: Books });
                  item.render();

                  if (index > 0) {
                       $("#books").append(item.el);
                  } else {
                      $("#books").html(item.el);
                  }

                  if (data.error) {
                    console.log(data.error.message);
                  }
              }

          });
          this.morebutton(term, index);
      },
      autocomplete: function( e ) {
        var term = $('#search_input').val();

        $( "#search_input" ).autocomplete({
            source: function( request, response ) {
              url = 'https://www.googleapis.com/books/v1/volumes?q='+encodeURIComponent(term)+'&maxResults=8&key='+api_key+'&fields=totalItems,items(accessInfo,volumeInfo)';
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


  var AllBooksView = Backbone.View.extend({
    tagName: "ul",

    initialize: function(){
        _.bindAll(this, "book");
    },
    render: function(){
        // console.log(this.collection.toJSON());
        this.collection.each(this.book);
    },
    book: function(model) {
        var bookItem = new BookView({ model: model });
        bookItem.render();
        $(this.el).append(bookItem.el);
    }
  });


  var BookView = Backbone.View.extend({
    tagName: "li",

    clicked: function(e){
       e.preventDefault();
       this.detail(this.model);
    },
    render: function(){
       var book = _.template( $("#books_template").html(), this.model.toJSON());
       $(this.el).append(book).css({'z-index':''+counter--+''});
    },
    detail: function(model) {
       var bookDetail = new DetailView({ el: $("#book-details"), model: model });
       bookDetail.render();
    },
    events: {
        "click": "clicked"
    }
  });

  var DetailView = Backbone.View.extend({
    el: $("#book-details"),

    initialize: function() {

      /* Black overlay */
      var overlay = '<div id="overlay"></div>';
      $(this.el).append(overlay);

      /* Define JSON objects */
      this.model.attributes.description = this.model.attributes.description || {};
      this.model.attributes.volumeInfo = this.model.attributes.volumeInfo || {};
      this.model.attributes.volumeInfo.imageLinks = this.model.attributes.volumeInfo.imageLinks || {};
    },
    render: function() {
      $.ajax({
        url: 'https://www.googleapis.com/books/v1/volumes/'+this.model.id,
        dataType: 'jsonp',
        data: 'fields=accessInfo,volumeInfo&key='+api_key,
        success: function (data) {
            var detail = new BookModel(data);
            console.log(detail.toJSON());
            var view = _.template( $("#detail_template").html(), detail.toJSON());
            $("#book-details").append(view);

            /* Description Toggle, need a new view else this one loads too late for jquery */
            var descToggle = new DescriptionView();
            descToggle.render();
        }
      });
    },
    hide: function(e) {
       e.preventDefault();
       $("#book-details").empty();
    },
    events: {
        "click .close-detail": "hide"
    }
  });

  var DescriptionView = Backbone.View.extend({
    el: $("#book-details"),
    
    render: function() {
        var adjustheight = 100;
        var moreText = "More »";
        $(".description .more-block").css('height', adjustheight).css('overflow', 'hidden');
        $(".description").append('<a href="#" class="more"></a>');
        $("a.more").text(moreText);
       // console.log($(this.el).html());
    },
    more: function(e) {
        e.preventDefault();
        var lessText = "« Less";
        $(".more-block").css('height', 'auto').css('overflow', 'visible');
        $("a.more").text(lessText).addClass('less');
    },
    less: function(e) {
        e.preventDefault();
        var adjustheight = 100;
        var moreText = "+  More";
        $(".more-block").css('height', adjustheight).css('overflow', 'hidden');
        $("a.more").text(moreText).removeClass('less');
    },
    events: {
        "click .more": "more",
        "click .less": "less"
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