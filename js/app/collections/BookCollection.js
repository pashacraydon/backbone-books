
define(function (require) {
  var Backbone = require('backbone'),
    BookModel = require('app/models/BookModel'),
    STORAGE_KEY = "my_books",
    BookCollection;

  require('localstorage');

  BookCollection = Backbone.Collection.extend({
    model: BookModel,
    localStorage: new Backbone.LocalStorage(STORAGE_KEY),

    comparator: 'client_timestamp',

    url: API_ENDPOINT,

    initialize: function () {
      this.on({
        'add': this.onAdd,
        'sync': this.onSuccess,
        'error': this.onError,
        'reset': this.onReset,
      }, this);
    },

    onReset: function (collection, options) {
      if (collection.length) {
      }
    },

    onSuccess: function (collection/*, errors, options*/) {
      this.remove(collection.models);
    },

    /* @trigger'd after unsuccessful server sync */
    onError: function (collection, errors/*, options*/) {
    },

    sync: function (method/*, collection, options*/) {
      if (this.length) {
        Backbone.sync.call(this, method, this);
      }
    },

    onAdd: function (/*model*/) {
    }

  });

    return BookCollection;
});