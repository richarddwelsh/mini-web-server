/* global __dirname */

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.text({type: "text/xml"})); // body-parser will treat incoming text/xml bodies as plain text

var mjml = require('mjml');

var staticRoot = __dirname + "/webroot"
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

// POST handler to translate MJML to HTML (takes XML; returns JSON object)
app.post('/Mjml2Html', function (req, res) {
	var incomingMjml = req.body;
	var resultingHtml;
	
	try {
		resultingHtml = mjml.mjml2html(incomingMjml, {level: "soft"});
	}
	catch(e)
	{
		res.send({errors: [e.message]});
	}

	res.send(resultingHtml);
})

app.use(function(req, res, next){
	// console.log('%s %s', req.method, req.url);
	next();
});

app.use(express.static(staticRoot));

app.listen(port);

console.log("Server running on port " + port + ", serving static files from " + staticRoot);