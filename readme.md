# d3.js boilerplate - dashboard template

This is a template for making a dashboard using d3.js along with
bootstrap, jquery-ui, and backbone. See
[the master branch of this repository](https://github.com/zmaril/d3.js-boilerplate#how-it-works)
for more information for the template system and philosophy behind
this project.

Click [here for deployed example](http://d3bdashboard.herokuapp.com/). 

## Types and purpose of files included 

### HTML

* index.html - This is what your webpage will be serving. 

### Coffeescript/Javascript

* js/index.coffee - The javascript file that tells d3.js what to do
* js/vendor/d3.v2.min.js - Minimized d3.js file. 
* js/vendor/jquery.min.js - Everybody needs a little jQuery
* js/vendor/bootstrap.min.js - jQuery plugins
* js/vendor/backbone.min.js - Manages url states
* js/vendor/jquery-ui[version].min.js - jQuery UI
* js/vendor/underscore.min.js - Underscore is small and useful. 

### less/CSS

* css/index.less - TODO: make this file
* css/bootstrap.less - bootstrap styling
* css/smoothness - Files need to render jquery UI


## Quick start

### Get the right template
* Clone - `git clone git@github.com:zmaril/d3.js-boilerplate.git`
* Rename - `mv d3.js-boilerplate my-ballin-document`
* Checkout - `git checkout dashboard`
* Clean up - `rm .git` (This gets rid of a bunch of files you won't
  need. Think of it as wiping clean all of the branches of this repo.) 
* Restart - `git init`

### Develop locally
* Move `cd my-ballin-document`
* Host `python -m SimpleHTTPServer` or [pyserve &](https://twitter.com/ZackMaril/status/165258473167261698)
* Navigate to localhost:8000

### Deploy Globally 
* Host - `heroku create my-ballin-document --stack cedar`
* Commit - `git commit -am "Totes my goats"`
* Push - `git push heroku master`

### Current TODOS
* Change example to something cool to attract more people to the
  project.

## License

### Major components:

* d3.js: [License](https://github.com/mbostock/d3/blob/master/LICENSE)
* jQuery/jQuery-ui: MIT/GPL license
* underscore:
  [License](https://github.com/documentcloud/underscore/blob/master/LICENSE)
* bootstrap: Apache license
* backbone:
  [License](https://github.com/documentcloud/backbone/blob/master/LICENSE)

### Everything else:

Public domain. 
