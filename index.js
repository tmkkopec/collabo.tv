"use strict";

var express = require('express'),
    app = express(),
    path = require('path'),
    webRTC = require('webrtc.io').listen(app),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser');

var port = process.env.PORT || 3000;

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

var server= app.listen(port, function() {
    console.log("App started on port 3000");
});
var io = require('socket.io').listen(server),
connections = {};

io.on('connection', function (socket) {

    socket.on('create or join', function (room) {
        var rooms = io.sockets.adapter.rooms;

        // create a room if it doesn't exist
        if (!(room in rooms)) {
            socket.join(room);
            socket.emit('created', room);
            console.log('created room', room);
        } else {
            // join the room if it's not full
            var numClients = Object.keys(rooms[room]).length;
            if (numClients == 1) {
                socket.join(room);

                // notify yourself and others in the room
                socket.emit('joined', room);
                socket.to(room).emit('join', room);

                console.log('joined room', room);
            } else { // max two clients
                console.log('room', room, 'is full');
            }
        }
    });

    socket.on('message', function (room, message) {
        console.log(room, message);
        socket.to(room).emit('message', message);
    });

});

module.exports = io;
