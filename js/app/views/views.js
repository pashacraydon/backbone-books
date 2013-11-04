define(function (require) {
    var _ = require('underscore'),
      $ = require('jquery'),
      Backbone = require('backbone'),
      v = require('app/utils/variables'),
      C = require('app/collections/BookCollection'),
      M = require('app/models/BookModel'),
      bookTemplate = require('text!app/templates/book.html'),
      detailsTemplate = require('text!app/templates/details.html'),
      SearchView,
      loadMoreView,
      BookView,
      DescriptionView,
      DetailView,
      AllBooksView;

  SearchView = Backbone.View.extend({
      el: $("#search_form"), 

      events: {
        "submit": "search", 
        "keyup": "searchAutocomplete"
      },
      initialize: _.once(function() {
        this.topics(v.TOPICS);
      }),
      destroy: function(){
        this.remove();
        this.unbind();
      },
      search: function( e ){
        e.preventDefault();  
        $('#books').html('');  //Remove previous search
        this.queryApi($('#search_input').val(), index='0'); //Do a search with the form input as the query
      },
      browse: function( term ){
        $('#books').html(''); 
        this.queryApi(term, index='0');  //Do a search with query passed in from a function
      },
      topics: function( terms ) {
        /*
        _.map(terms, function(num,key) { 
        }); */
        var culinary = new SearchView(),
            art = new SearchView(),
            entertainment = new SearchView();

        culinary.queryApi('subject:Culinary',index='0');
        $('#books').prepend('<h1>Culinary</h1>');
        art.queryApi('subject:Art',index='0');
        $('#books').prepend('<h1>Art</h1>');
        entertainment.queryApi('subject:Entertainment',index='0');
        $('#books').prepend('<h1>Entertainment</h1>');
      },
      doAjax: function ( url, data ) {
        return $.ajax({
          dataType: 'jsonp',
          data: data,
          cache: false,
          url: url
        });
      },
      queryApi: function( term, index ) {
        var url = 'https://www.googleapis.com/books/v1/volumes?',
            data = 'q='+encodeURIComponent(term)+'&startIndex='+index+'&maxResults='+v.NUM_BOOKS+'&key='+v.API_KEY+'&fields=totalItems,items(id,volumeInfo)';

        aj = this.doAjax(url, data);

        aj.done(function () {
          var Books = new C.BookCollection(),
              data = aj.responseJSON;

          //Put JSON books into a model, then into a collection
          if (data) {
            for(var i in data.items) {
              data.items[i].volumeInfo = data.items[i].volumeInfo || {}; //Define object
              data.items[i].volumeInfo.imageLinks = data.items[i].volumeInfo.imageLinks || {}; 
              data.items[i].volumeInfo.imageLinks.thumbnail = data.items[i].volumeInfo.imageLinks.thumbnail || '';
              if (data.items[i].volumeInfo.imageLinks.thumbnail) {
                var book = new M.BookModel(data.items[i]);
                Books.add(book);
              }
            }
          }

          var item = new AllBooksView({ collection: Books });
          item.render();
          //index > 0 ? $("#books").append(item.el) : $("#books").html(item.el);
          $("#books").append(item.el);
        });

        this.destroy();

        var more = new loadMoreView();
        more.render(term, index);
      },

      searchAutocomplete: function( e ) {
        var $searchForm = $('#search_input'),
          term = $searchForm.val(),
          url = 'https://www.googleapis.com/books/v1/volumes?q='+encodeURIComponent(term)+'&maxResults=8&key='+v.API_KEY+'&fields=totalItems,items(accessInfo,volumeInfo)';

        //http://jqueryui.com/autocomplete/
        $searchForm.autocomplete({
          source: function( request, response ) {
            $.getJSON(url + '&callback=?', function(data) {
              var dropdown = [];
              for(var i in data.items) {
                var ele = {},
                  subtitle = typeof data.items[i].volumeInfo.subtitle !== "undefined" ? ': '+data.items[i].volumeInfo.subtitle : '';
                  ele = data.items[i].volumeInfo.title+subtitle; //Create array of object attributes autocomplete can parse
                  dropdown.push(ele);
                }
                dropdown = _.unique(dropdown);
                response(dropdown);
              });
            },
            select: function( event, ui ) {
              var search = new SearchView();
              search.browse(ui.item.value, index='0');
            }
        });
      }
  });

  loadMoreView = Backbone.View.extend({
      el: $("#loading"),

      events: {
         "click": "morebooks"
      },
      render: function(term, index) {
         this.$el.find('.wrap-btn').remove();
         var countIndex = parseInt(index) + parseInt(v.NUM_BOOKS),
            morebtn = '<div class="wrap-btn" style="text-align: center;"><a data-index="'+countIndex+'" data-term="'+term+'" class="btn more-button" href="#"> <strong>&#43;</strong> Load some more books</a></div>';
         this.$el.append(morebtn);
      }, 
      morebooks: function(e) {
         var term = $('.more-button').data('term'),
            index = $('.more-button').data('index'),
            loadMore = new SearchView();

         e.preventDefault(); 
         loadMore.queryApi(term, index);
         loadMore.undelegate(); // Todo remove ghost view better
      }
  });

  AllBooksView = Backbone.View.extend({
    tagName: "ul",

    initialize: function(){
        _.bindAll(this, "book");  //bind 'this' object to book method
    },
    render: function(){
        //Render each book in the collection
        this.collection.each(this.book); 
        // console.log(this.collection.toJSON());
    },
    book: function(model) {
        var bookItem = new BookView({ model: model });
        bookItem.render();
        this.$el.append(bookItem.el);
    }
  });


  BookView = Backbone.View.extend({
    tagName: "li",

    template: _.template(bookTemplate),

    events: {
        "click": "clicked"
    },
    clicked: function(e){
       e.preventDefault();
       this.detail(this.model);
    },
    render: function(){
       var book = _.template(this.template(this.model.toJSON()));
       this.$el.append(book);
    },
    detail: function(model) {
       var bookDetail = new DetailView({ el: $("#book-details"), model: model });
       bookDetail.render();
       bookDetail.undelegate();  //todo: get rid of zombie views better
    }
  });

  DetailView = Backbone.View.extend({

    el: $("#book-details"),

    events: {
        "click .close-detail": "hide",
        "click #overlay": "hide"
    },

    initialize: function() {
      /* Add a faded overlay */
      this.$el.find('#overlay').remove(); //Remove previous overlay
      var overlay = '<div id="overlay" style="display: none;"></div>';
      this.$el.append(overlay).find('#overlay').fadeIn('slow');

      /* css3 transforms are buggy with z-index, need to remove them under overlay */
      this.$el.next().find('li').find('.book').addClass('removeTransform');

      /* Define JSON objects */
      this.model.attributes.description = this.model.attributes.description || {};
      this.model.attributes.volumeInfo = this.model.attributes.volumeInfo || {};
      this.model.attributes.volumeInfo.imageLinks = this.model.attributes.volumeInfo.imageLinks || {};
    },
    doAjax: function ( url, data ) {
      return $.ajax({
        dataType: 'jsonp',
        data: data,
        url: url
      });
    },
    render: function() {
      var url = 'https://www.googleapis.com/books/v1/volumes/'+this.model.id,
          data = 'fields=accessInfo,volumeInfo&key='+v.API_KEY;

        aj = this.doAjax(url, data);

        aj.done(function () {
            var detail = new M.BookModel(aj.responseJSON),
              //Load the books model into the details template
              view = _.template(detailsTemplate, detail.toJSON());

            $("#book-details").find('#detail-view-template').remove();
            $("#book-details").append(view).find('#detail-view-template').show().addClass('down');

            var descToggle = new DescriptionView({ el: "#wrap-info" });
            descToggle.render();
            descToggle.undelegate(); //todo: get rid of zombie views better

        });
    },
    hide: function(e) {
       e.preventDefault();
       this.$el.find('#detail-view-template').removeClass('down').addClass('up');
       this.$el.find('#overlay').fadeOut('slow');
       this.$el.next().find('li').find('.book').removeClass('removeTransform'); //CSS3 Transforms have odd z-index issue
    }
  });

  DescriptionView = Backbone.View.extend({
    events: {
        "click .more": "more",
        "click .less": "less"
    },
    render: function() {
        var adjustheight = 200,
          moreText = "More »";
        this.$el.find(".description").find(".more-block").css('height', adjustheight).css('overflow', 'hidden');
        this.$el.find(".description").append('<div class="hide-description overflow"><a href="#" class="more"></a></div>');
        this.$el.find("a.more").text(moreText);
    },
    more: function(e) {
        e.preventDefault();
        var lessText = "« Less";
        this.$el.find(".description").find(".more-block").css('height', 'auto').css('overflow', 'visible');
        this.$el.find(".hide-description").removeClass('overflow');
        this.$el.find("a.more").text(lessText).addClass('less');
    },
    less: function(e) {
        e.preventDefault();
        var adjustheight = 200,
          moreText = "More »";
        this.$el.find(".description").find(".more-block").css('height', adjustheight).css('overflow', 'hidden');
        this.$el.find(".hide-description").addClass('overflow');
        this.$el.find("a.more").text(moreText).removeClass('less');
    }
  });

  // public API
  return {
      SearchView: SearchView,
      loadMoreView: loadMoreView,
      BookView: BookView,
      DescriptionView: DescriptionView,
      DetailView: DetailView,
      AllBooksView: AllBooksView
  };

});