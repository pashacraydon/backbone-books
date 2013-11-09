define(function (require) {
    var _ = require('underscore'),
      $ = require('jquery'),
      Backbone = require('backbone'),
      v = require('app/utils/variables'),
      C = require('app/collections/BookCollection'),
      M = require('app/models/BookModel'),
      myCollection = require('app/collections/myLibrary'),
      helpers = require('app/utils/helpers'),
      bookTemplate = require('text!app/templates/book.html'),
      detailsTemplate = require('text!app/templates/details.html'),
      welcomeTemplate = require('text!app/templates/welcome.html'),
      SearchView,
      BookView,
      DetailView,
      AllBooksView;

  SearchView = Backbone.View.extend({
    //Attach this view to this html element,
    //similar to document.getElementById('#search_form')
    el: $("#search_form"), 

    //the DOM events specific to this view
    events: {
      "submit": "search", 
      "keyup": "searchAutocomplete"
    },

    initialize: _.once(function() {
      //On first page load, check for books in localStorage
      //unless its a router
      if (window.location.hash === '') {
        this.queryLocalStorage();
      }

      helpers.topicsForm();
    }),

    search: function(e){
      var $value = $('#search_input').val();
      e.preventDefault();  
      //Remove previous search results
      $('#books').html('');
      //Do a search with the form input as the query
      this.queryApi($value, index='0', v.MAX_DEFAULT);
    },

    browse: function(term, index, maxResults) {
      $('#books').html(''); 
      //Do a search with query passed in from a function
      this.queryApi(term, index, maxResults); 
    },

    topics: function(terms) {
      var self = this,
          welcomeMsg = _.template(welcomeTemplate);

      //If localStorage is supported, 
      //include a description about 'my books' library
      if (Modernizr.localstorage) {
        $('#books').prepend(welcomeMsg);
      }

      //load topics, requires an API query for each topic
      _.each(terms, function(topic) { 
        self.queryApi('subject:'+topic.subject,index='0', maxResults='5', topic.subject);
      }); 
    },

    doAjax: function (url, data) {
      return $.ajax({
        dataType: 'jsonp',
        data: data,
        cache: false,
        url: url
      });
    },

    queryApi: function(term, index, maxResults, subject) {
      var aj,
          url = 'https://www.googleapis.com/books/v1/volumes?',
          data = 'q='+encodeURIComponent(term)+'&startIndex='+index+'&maxResults='+maxResults+'&key='+v.API_KEY+'&projection=full&fields=totalItems,items(id,volumeInfo)';

      aj = this.doAjax(url, data);

      //jQuery promise object tells us when ajax is done
      aj.done(function () {
        var Books = new C.BookCollection(),
          data = aj.responseJSON;

        //Traverse the API response and put each JSON book into a model
        if (data) {
          _.each(data.items, function(item) { 
            //Define JSON values, this prevents ajax errors
            item.volumeInfo = item.volumeInfo || {};
            item.volumeInfo.imageLinks = item.volumeInfo.imageLinks || {};
            item.volumeInfo.imageLinks.thumbnail = item.volumeInfo.imageLinks.thumbnail || '';
            if (item.volumeInfo.imageLinks.thumbnail) {
              var book = new M.BookModel(item);
              Books.add(book);
            }
          }); 
        }

        //Remove old ajax data
        delete aj;

        //Instantiate the AllBooksViews with a collection of books and render them
        var item = new AllBooksView({ collection: Books });
            item.render();

        //If a topic and collection isn't empty, 
        //prepend with the topic title and append a 'more' link
        if (subject && Books.length > 0) {
          item.topic(subject, maxResults);
        }

        //If the index is greater then 0 and this isn't topics, 
        //replace new books with old books. Otherwise APPEND to old books.
        index > 0 || subject ? $("#books").append(item.el) : $("#books").html(item.el);
      });

      //Instantiate view for loading more books, except if its topics (not a search or browse)
      if (!subject) {
        this.moreBooks(term, index, maxResults);
      }
    },

    /*
    moreBooks: function (term, index, maxResults) {
      var $more = $('#more-books'),
        self = this,
        $btn = $more.find('.more-button');

      $more.on('click', function (e) {
        e.preventDefault(); 
        var maxResults = maxResults || v.MAX_DEFAULT,
          newIndex = parseInt(index) + parseInt(maxResults);
          self.queryApi(term, newIndex, maxResults);
          this.undelegate(); // Todo: do better garbarge collection
      });

      $btn.data("index", newIndex);
    }, */

    queryLocalStorage: function() {
      var myBooks = myCollection,
          self = this;

      myBooks.fetch({
        success:function() {
          //If there are books in the localStorage collection
          //then load and render them
          if (myBooks.length > 0) {
            var item = new AllBooksView({ collection: myBooks }),
                title = '<h1>My Library</h1>';
                item.render();
                $("#books").html(item.el).prepend(title);
          //Otherwise, load up some topics
          } else {
            self.topics(v.TOPICS);
          }
        }
      });
    },

    searchAutocomplete: function( e ) {
      var $searchForm = $('#search_input'),
        term = $searchForm.val(),
        url = 'https://www.googleapis.com/books/v1/volumes?q='+encodeURIComponent(term)+'&maxResults=8&key='+v.API_KEY+'&fields=totalItems,items(accessInfo,volumeInfo)';

      //Autcomplete function from jQuery UI (http://jqueryui.com/autocomplete/)
      $searchForm.autocomplete({
        source: function( request, response ) {
          $.getJSON(url + '&callback=?', function(data) {
            var dropdown = [];
               _.each(data.items, function(item) { 
                var ele = {},
                  //Use the titles and subtitles for the autocomplete, if they exist
                  subtitle = typeof item.volumeInfo.subtitle !== "undefined" ? ': '+item.volumeInfo.subtitle : '';
                  //Create an array of object attributes autocomplete can parse
                  ele = item.volumeInfo.title.concat(subtitle); 
                  dropdown.push(ele);
                });
              //Remove duplicates
              dropdown = _.uniq(dropdown);
              response(dropdown);
            }); 
          },
          select: function( event, ui ) {
            //Instantiate a new search view and populate the autocomplete with an API query
            var search = new SearchView();
            search.queryApi(ui.item.value, index='0',v.MAX_DEFAULT);
          }
      });
    }
  });

  /*
  loadMoreView = Backbone.View.extend({

    el: $("#loading"),

    events: {
      "click": "morebooks"
    },

    render: function(term, index, maxResults) {
      this.$el.find('.wrap-btn').remove();
      var maxResults = maxResults || v.MAX_DEFAULT,
        countIndex = parseInt(index) + parseInt(maxResults),
        morebtn = '<div class="wrap-btn" style="text-align: center;"><a data-index="'+countIndex+'" data-term="'+term+'" class="btn more-button" href="#"> <strong>&#43;</strong> More of these books</a></div>';
        this.$el.append(morebtn);
    }, 

    morebooks: function(e) {
      var term = $('.more-button').data('term'),
        index = $('.more-button').data('index'),
        loadMore = new SearchView();
        e.preventDefault(); 
        loadMore.queryApi(term, index, v.MAX_DEFAULT);
        loadMore.undelegate('#loading','click'); // Todo: do better garbarge collection
      }
  }); */

  AllBooksView = Backbone.View.extend({

    //all books go inside an unordered list tag
    tagName: "ul",

    initialize: function() {
      //bind 'this' object to book method
      _.bindAll(this, "book");
      //helper CSS class for determining when this view has loaded, removes Ajax spinner gif in the CSS
      $('body').addClass('loaded');
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
      e.currentTarget.innerText = '+ Save book to my library';
    },

    saveBook: function(e) {
      var self = this;

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
      });

      //Now make it a 'remove' button instead
      e.currentTarget.className = 'btn remove-book';
      e.currentTarget.innerText = '- Remove book from my library';
    },

    hide: function(e) {
      e.preventDefault();
      this.$el.find('#detail-view-template').removeClass('down').addClass('up');
      this.$el.find('#overlay').fadeOut('slow');
      this.$el.next().find('li').find('.book').removeClass('removeTransform');
      this.$el.undelegate(); // Todo: do better garbarge collection
    }
  });


  // public API
  return {
    SearchView: SearchView,
    BookView: BookView,
    DetailView: DetailView,
    AllBooksView: AllBooksView
  };

});