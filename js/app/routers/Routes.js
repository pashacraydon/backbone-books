
define(function (require) {
  var Backbone = require('backbone'),
    v = require('app/utils/variables'),
    V = require('app/views/views'),
    AppRouter;

  AppRouter = Backbone.Router.extend({
    routes: {
      "": "index",
      "browse/:query": "browse", // #browse/php
      "browse/subject/:query/:index": "subject",
      "browse/publisher/:query": "publisher",
      "browse/author/:query": "author"
    },
    index: function() {
      var search = new V.SearchView();
    },
    browse: function(term) {
      var search = new V.SearchView();
      search.browse(term);
    },
    subject: function(term, index) {
      var search = new V.SearchView();
      console.log(index);
      search.browse('subject:'+term, index, v.MAX_DEFAULT);
    },
    publisher: function(term) {
      var search = new V.SearchView();
      search.browse('inpublisher:'+term);
    },
    author: function(term) {
      var search = new V.SearchView();
      search.browse('inauthor:'+term);
    }
  });

  return {
      AppRouter: AppRouter
  };
});