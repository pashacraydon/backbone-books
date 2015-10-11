# Search Google Books API with Backbone.js

This is an experimental backbone.js project I built to help myself learn the language.

* It's organized with require.js
* It uses localStorage for saving books in collections and retrieving them

Demo: http://backbonejsbooks.appspot.com/

![ScreenShot](https://raw.github.com/pashasc/backbone_books/screenshot/bb-screen.jpg)

# Dev

### Setup

	$ cd penguin // cd to index.html in the penguin folder
	$ python -m SimpleHTTPServer [port] // run python SimpleHTTPServer

Visit the site in a browser, http://localhost.com:[port]

### Install grunt

    $ npm install -g grunt-cli
    $ npm install
    $ grunt

### Compile code

    $ npm install -g requirejs
    $ r.js -o app.build.js