
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
            "smallThumbnail": "",
            "thumbnail": ""
            }
          ]
        }
      ]
    }
  });

  return {
      BookModel: BookModel
  };
});