// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones, 
requirejs.config({
    "baseUrl": "js/libs",
    "paths": {
      "app": "../app",
      "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.1/jquery.min",
      "jqueryui": "//ajax.googleapis.com/ajax/libs/jqueryui/1.8.2/jquery-ui.min",
      "modernizr": "//cdnjs.cloudflare.com/ajax/libs/modernizr/2.6.2/modernizr.min",
      "underscore": "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min",
      "backbone": "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min"
    },
    shim: {
    	'backbone': {
    		deps: ['underscore', 'jquery'],
    		exposts: 'backbone'
    	},
    	'underscore': {
    		exports: '_'
    	},
    	'booklet': {
    		deps: ['jquery', 'backbone', 'jqueryui', 'moderniz']
    	}
    }
});

// Load the main app module to start the app
requirejs(["app/booklet"]);