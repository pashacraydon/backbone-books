
define(function (require) {
    var Backbone = require('backbone'),
      BookModel;

  BookModel = Backbone.Model.extend({
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
    },
    initialize: function() {
      console.log('This model has been initialized.');
      this.on('change', function() {
        console.log(this.model);
      });
    }
  });

  return {
      BookModel: BookModel
  };
});