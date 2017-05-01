var express = require('express'),
	app = express(),
	path = require('path'),
	webRTC = require('webrtc.io').listen(app),
	favicon = require('serve-favicon');

var port = process.env.PORT || 3000;

app.use(favicon(path.join(__dirname, 'public/favicon.ico')))
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

app.get('/debug', function (req, res) {
	res.set('Content-Type', 'application/json')
	res.send(JSON.stringify(req.route, null, 4));
});

app.listen(port, function() {
	console.log("App started on port 3000");
});
