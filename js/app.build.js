//Docs: https://github.com/jrburke/r.js/blob/master/build/example.build.js
({
    appDir: "../",
    baseUrl: "js",
    dir: "../../backbone_books_build",
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
    },
    optimize: "uglify",
    skipDirOptimize: true,
    optimizeCss: "standard",
    modules: [
        {
            name: "app",
            exclude: [

            ]
        }
    ]
})
