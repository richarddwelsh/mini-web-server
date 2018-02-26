/* global __dirname */

var express = require('express');
var app = express();

var path = require('path');

var bodyParser = require('body-parser');
app.use(bodyParser.text({type: "text/xml"})); // body-parser will treat incoming text/xml bodies as plain text
app.use(bodyParser.urlencoded());
app.use(bodyParser.text({type: "text/plain"}));

var mjml = require('mjml');

var nodemailer = require('nodemailer');
var PASSWD_DIR = path.resolve((process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE), '.credentials');
var PASSWD_PATH = path.resolve(PASSWD_DIR, 'smtp_credentials.json');
var fs = require('fs');
var transporter = nodemailer.createTransport(JSON.parse(fs.readFileSync(PASSWD_PATH)));

var staticRoot = path.resolve(__dirname, "webroot")
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

// POST handler to send test emails
app.post('/SendTest', function (req, res, next) {
	var emailOut = req.body;
	emailOut.from = "Dev <dev@welshdesign.co.uk>";

	transporter.sendMail(emailOut)
	.then(
		response => {
			res.send(response)
		},
		next
	)
})

// GET handler to load files
app.get(/\/MJML\/(.+)/, function (req, res, next) {
	// not bothered about mime-type, etc.
	res.send(fs.readFileSync(path.resolve(__dirname, '..', 'MJML', req.params[0])));
})

// PUT handler to save files
app.put(/\/MJML\/(.+)/, function (req, res, next) {

	fs.writeFileSync(path.resolve(__dirname, '..', 'MJML', req.params[0]), req.body); // simple as...
	res.sendStatus(200);
})

app.use(function(req, res, next){
	// console.log('%s %s', req.method, req.url);
	next();
});

app.use(express.static(staticRoot));

app.listen(port);

console.log("Server running on port " + port + ", serving static files from " + staticRoot);

var open = require("open");
open("http://localhost:" + port + "/MjmlTool.html")