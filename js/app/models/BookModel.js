
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