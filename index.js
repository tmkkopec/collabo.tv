"use strict";

var WebSocket = require("ws");
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8088});


var wsList = [];



var express = require('express'),
    app = express(),
    path = require('path'),
    webRTC = require('webrtc.io').listen(app),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser');

var port = process.env.PORT || 3000;

wss.on('connection', function(ws){
	console.log('WS connection established!')
	wsList.push(ws);
	var username=(wsList.indexOf(ws)).toString();
	var json = { username: username, id:"name"}
	ws.send(JSON.stringify(json));
	
	ws.on('close', function(){
		wsList.splice(wsList.indexOf(ws),1);
		console.log('WS closed!')
	});

	ws.on('message', function(message){
		console.log('Got ws message: '+message);
		for(var i=0;i<wsList.length;i++){
			// send to everybody on the site
			wsList[i].send(message);
		}
	});
});

app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

app.get('/join', function(req, res) {
    var query = req.query.nickname.split('@');
    res.cookie('nickname', query[0], { expires: new Date(Date.now() + 60000) });
    res.redirect('/room/' + query[1]);
});

app.get('/room/:id', function(req, res) {
    if (req.cookies.nickname)
        res.sendFile(path.join(__dirname, 'public', 'views', 'room.html'));
    else
        res.redirect('/');
});

app.get('/room', function(req, res) {
    res.redirect('/');
})

app.get('/debug', function(req, res) {
    res.clearCookie('nickname');
    res.set('Content-Type', 'text/html');
    res.send(req.cookies);
});

app.listen(port, function() {
    console.log("App started on port 3000");
});
