# README #

Prerequisites: `node`, `npm`

* Clone this repository
* run `npm install`
* start the server with `node main.js` or `npm run start`

Optional arguments:
```
node main.js [ <root-serve-dir> [ <port> ] ]
```

If you want to run this through `ngrok` try:
```
ngrok http -host-header=rewrite <port>
```