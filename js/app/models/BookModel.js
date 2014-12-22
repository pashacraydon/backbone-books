
define(function (require) {
    var Backbone = require('backbone'),
      BookModel;

  /** A representation of a book
  * @class, @augments Backbone.Model
  * */
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
    },

    initialize: function () {
      this.on({
        'invalid': this.onInvalid,
        'remove': this.onRemove,
        'change': this.onChange
      }, this);
    },

    validate: function (attrs) {
    },

    isValid: function () {
      return !this.validate(this.attributes);
    },

    onChange: function () {

    },

    /* the model failed validation */
    onInvalid: function (model, error) {
    },

    onRemove: function (model) {
      model.destroy();
    }

  });

  return BookModel;
});