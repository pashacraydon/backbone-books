
define(function (require) {
  var Backbone = require('backbone'),
    v = require('app/utils/variables'),
    SearchView = require('app/views/SearchView'),
    AppRouter;

  AppRouter = Backbone.Router.extend({
    routes: {
      "": "index",
      "browse/:query": "browse", // #browse/php
      "browse/subject/:query/:index": "subject",
      "browse/publisher/:query/:index": "publisher",
      "browse/author/:query/:index": "author",
      "mybooks": "mybooks"
    },
    index: function() {
      var search = new SearchView();
    },
    mybooks: function() {
      var search = new SearchView();
      search.queryLocalStorage();
    },
    browse: function(term) {
      var search = new SearchView();
      search.browse(term, index='0', v.MAX_DEFAULT);
    },
    subject: function(term, index) {
      var search = new SearchView();
      search.browse('subject:'+term, index, v.MAX_DEFAULT);
    },
    publisher: function(term, index) {
      var search = new SearchView();
      search.browse('inpublisher:'+term, index, v.MAX_DEFAULT);
    },
    author: function(term, index) {
      var search = new SearchView();
      search.browse('inauthor:'+term, index, v.MAX_DEFAULT);
    }
  });

  return AppRouter;
});