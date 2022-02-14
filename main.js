/* global __dirname */

const args = process.argv;
const path = require('path');
const express = require('express');
const open = require('open');
const app = express();
const bodyParser = require('body-parser');

// args[0] will be path to node.js
// args[1] will be path to this file

// args[2] (optional) root path to serve from
const staticRoot = args[2] == null ? path.join(__dirname, "..") :
	path.isAbsolute(args[2]) ? args[2] : path.join(__dirname, "..", args[2] || ".");

const connectSSI = require('connect-ssi');
app.use(connectSSI({
	baseDir: path.join(__dirname, ".."),
	ext: '.shtml'
}))

app.use(bodyParser.urlencoded({ type: '*/x-www-form-urlencoded' }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.text({ type: '*/*' }))

// args[3] (optional) port to serve from
const port = (Number(args[3])) ? Number(args[3]) : 8002;

// respond with Custom message when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send(`Serving from ${staticRoot}`)
})

app.post(/.*/, function(req, res, next){
	console.log('────────────────────────────────────────────────────────');
	console.log('%s %s %s', req.method, req.baseUrl + req.url, req.headers['content-type']);
	console.log(JSON.stringify(req.body));
	res.send(`<table><tr><td>Method</td><td>${req.method}</td></tr><tr><td>URL</td><td>${req.baseUrl + req.url}</td></tr><tr><td>Content-type</td><td>${req.headers['content-type']}</td></tr><tr><td>Body (parsed)</td><td>${JSON.stringify(req.body)}</td></tr></table>`)
});

app.use(function(req, res, next){
	console.log('%s %s', req.method, req.url);
	next();
});

app.use(express.static(staticRoot));

app.listen(port);

console.log(`Server running on port ${port}, serving static files from ${staticRoot}`);

// args[4] (optional) root-relative path to open in browser
const initUrl = args[4] || 'Index.html';

open(`http://localhost:${port}/${initUrl}`);