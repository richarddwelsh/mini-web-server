/* global __dirname */

const args = process.argv;
const path = require('path');
const express = require('express');
const app = express();

const staticRoot = path.join(__dirname, "..", args[2] || ".");

const connectSSI = require('connect-ssi');
app.use(connectSSI({
	baseDir: path.join(__dirname, ".."),
	ext: '.shtml'
}))

const port = (Number(args[3])) ? Number(args[3]) : 8002;

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

console.log(`Server running on port ${port}, serving static files from ${staticRoot}`);