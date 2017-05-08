"use strict";

var express = require('express'),
    app = express(),
    path = require('path'),
    webRTC = require('webrtc.io').listen(app),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser');

var port = process.env.PORT || 3000;
var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');

app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

app.get('/join', function (req, res) {
    var query = req.query.nickname.split('@');
    res.cookie('nickname', query[0], {expires: new Date(Date.now() + 60000)});
    res.redirect('/room/' + query[1]);
});

app.get('/room/:id', function (req, res) {
    if (req.cookies.nickname)
        res.sendFile(path.join(__dirname, 'public', 'views', 'room.html'));
    else
        res.redirect('/');
});

app.get('/room', function (req, res) {
    res.redirect('/');
})

app.get('/debug', function (req, res) {
    res.clearCookie('nickname');
    res.set('Content-Type', 'text/html');
    res.send(req.cookies);
});

var server = require('http').createServer(app);  
server.listen(port);  
var io = socketIO.listen(server);
io.sockets.on('connection', function(socket) {

    // convenience function to log server messages on the client
    function log() {
        var array = ['Message from server:'];
        array.push.apply(array, arguments);
        socket.emit('log', array);
    }

    socket.on('message', function(message) {
        log('Client said: ', message);
        // for a real app, would be room-only (not broadcast)
        socket.broadcast.emit('message', message);
    });

    socket.on('create or join', function(room) {
        log('Received request to create or join room ' + room);

        var numClients = io.sockets.sockets.length;
        log('Room ' + room + ' now has ' + numClients + ' client(s)');

        if (numClients === 1) {
            socket.join(room);
            log('Client ID ' + socket.id + ' created room ' + room);
            socket.emit('created', room, socket.id);

        } else if (numClients === 2) {
            log('Client ID ' + socket.id + ' joined room ' + room);
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room, socket.id);
            io.sockets.in(room).emit('ready');
        } else { // max two clients
            socket.emit('full', room);
        }
    });

    socket.on('ipaddr', function() {
        var ifaces = os.networkInterfaces();
        for (var dev in ifaces) {
            ifaces[dev].forEach(function(details) {
                if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    socket.emit('ipaddr', details.address);
                }
            });
        }
    });

    socket.on('bye', function(){
        console.log('received bye');
    });

});
