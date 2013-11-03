
define(function (require) {
    var Backbone = require('backbone'),
      V = require('app/Views/views'),
      AppRouter;

  Backbone.View.prototype.close = function(){
      this.remove();
      this.unbind();
      if (this.onClose){
        this.onClose();
      }
  }

  AppRouter = Backbone.Router.extend({
    routes: {
        "": "index",
        "browse/:query": "browse", // #browse/php
        "browse/subject/:query": "subject",
        "browse/publisher/:query": "publisher"
    },
    index: function() {
      var search = new V.SearchView();
    },
    browse: function( term ) {
      var search = new V.SearchView();
      search.browse(term);
    },
    subject: function( term ) {
      var search = new V.SearchView();
      search.browse('+subject:'+term);
    },
    publisher: function( term ) {
      var search = new V.SearchView();
      search.browse('+inpublisher:'+term);
    }
  });

  return {
      AppRouter: AppRouter
  };
});