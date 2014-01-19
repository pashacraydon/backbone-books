/* 
 * Place third party dependencies in the lib folder.
 * Configure loading modules from the lib directory or CDN.
*/
requirejs.config({
  baseUrl: "js/",
  paths: {
    "underscore":             "libs/underscore.min",
    backbone:                 "libs/backbone",
    "jquery":                 "libs/jquery-1.10.2.min",
    "jqueryui":               "libs/jquery-ui-1.10.4.custom.min",
    css_browser_selector:     "libs/css_browser_selector",
    "modernizr":              "libs/modernizr.custom",
    text:                     "libs/require.text",
    localstorage:             "libs/backbone.localstorage",
    "browser":                "libs/css_browser_selector"
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

