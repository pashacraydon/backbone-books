/* 
 * Place third party dependencies in the lib folder.
 * Configure loading modules from the lib directory or CDN.
*/
requirejs.config({
  baseUrl: "/js/",
  paths: {
    "underscore": "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min",
    backbone: "libs/backbone",
    "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.1/jquery.min",
    "jqueryui": "//ajax.googleapis.com/ajax/libs/jqueryui/1.8.2/jquery-ui.min",
    css_browser_selector: "libs/css_browser_selector",
    "modernizr": "//cdnjs.cloudflare.com/ajax/libs/modernizr/2.6.2/modernizr.min",
    text: "libs/require.text",
    localstorage: "libs/backbone.localstorage"
  },
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    localstorage: {
      deps: ['underscore','jquery','backbone']
    },
    jqueryui: {
      deps: ['jquery']
    },
    'app/_init': {
    	deps: ['jquery', 'underscore', 'backbone', 'jqueryui', 'modernizr']
    }
  }
});

// Load the main app module to start the app
requirejs(["app/_init"]);

