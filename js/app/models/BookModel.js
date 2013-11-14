
define(function (require) {
    var Backbone = require('backbone'),
      BookModel;

  BookModel = Backbone.Model.extend({
    defaults: {
      //Default JSON fields,
      //Prevent 'undefined' ajax errors
      "volumeInfo": [
      {
        "description": "",
        "title": "",
        "imageLinks": [
          {
            "smallThumbnail": "http://placehold.it/128x195/ffffff/999999",
            "thumbnail": "http://placehold.it/128x195/ffffff/999999"
            }
          ]
        }
      ]
    }
  });

  return BookModel;
});