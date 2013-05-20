(function($) {

  var api_key = 'AIzaSyBhBph_ccmIlFn9YSrvhCE_8zrYxazyqJ8';


  var BookletModel = Backbone.Model.extend({
    search: function(query) {
       var self = this;
        $.ajax({
          url: 'https://www.googleapis.com/books/v1/volumes?',
          data: 'q='+query+'&maxResults=40&key='+api_key+'&fields=totalItems,items(id,volumeInfo/title,volumeInfo/subtitle,volumeInfo/authors,volumeInfo/publishedDate,volumeInfo/description,volumeInfo/imageLinks)',
          dataType: 'jsonp',
          success: function(data) {
            //console.log(data);
            for(var i in data.items) {
                console.log(data.items[i].volumeInfo);
              }
          }
        });
      }
  });



  window.books = new BookletModel();

  $(document).ready(function() {
      books.search('php');
  });


})(jQuery);