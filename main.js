/* global __dirname */

var express = require('express');
var app = express();

var staticRoot = __dirname + "/../webroot"
var port = 8001

var connectSSI = require('connect-ssi');
app.use(connectSSI({
	baseDir: staticRoot,
	ext: '.shtml'
}))

// respond with Custom message when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('Serving from' + staticRoot)
})

app.use(function(req, res, next){
	console.log('%s %s', req.method, req.url);
	next();
});

app.use(express.static(staticRoot));

app.listen(port);

console.log("Server running on port " + port + ", serving static files from " + staticRoot);