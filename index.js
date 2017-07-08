'use strict';

const express = require('express'),
    app = express(),
    path = require('path'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    os = require('os'),
    https = require('https'),
    fs = require('fs'),
    socketIO = require('socket.io'),
    port = process.env.PORT || 3000,
    cookieExpiration = 600000;

const certsPath = path.join(__dirname, 'certs');
const options = {
    key: fs.readFileSync(path.join(certsPath, 'server.key')),
    cert: fs.readFileSync(path.join(certsPath, 'server.crt')),
    requestCert: false,
    rejectUnauthorized: true
};

app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

app.get('/join', function (req, res) {
    const query = req.query.nickname.split('@');
    res.cookie('nickname', query[0], {expires: new Date(Date.now() + cookieExpiration)});
    res.cookie('roomID', query[1], {expires: new Date(Date.now() + cookieExpiration)});
    res.redirect('/room/' + query[1]);
});

app.get('/room/:id', function (req, res) {
    if (req.cookies.nickname)
        res.sendFile(path.join(__dirname, 'public', 'views', 'home.html'));
    else
        res.redirect('/');
});

app.get('/room', function (req, res) {
    res.redirect('/');
});

app.post('/logout', function (req, res) {
    res.clearCookie('nickname', 'roomID');
    res.redirect('/');
});

app.get('/debug', function (req, res) {
    res.clearCookie('nickname');
    res.set('Content-Type', 'text/html');
    res.send(req.cookies);
});

const server = https.createServer(options, app).listen(port);
const io = socketIO.listen(server);
io.sockets.on('connection', function (socket) {

    // convenience function to log server messages on the client
    function log() {
        const array = ['Message from server:'];
        array.push.apply(array, arguments);
        socket.emit('log', array);
    }

    socket.on('message', function (message) {
        // for a real app, would be room-only (not broadcast)
        socket.broadcast.emit('message', message);
    });

    socket.on('create or join', function (room) {
        log('Received request to create or join room ' + room);

        const abc = io.sockets.sockets;
        const numClients = Object.keys(abc).length;
        log('Room ' + room + ' now has ' + numClients + ' client(s)');

        if (numClients === 1) {
            socket.join(room);
            log(socket.id, room);
            socket.emit('created', room, socket.id);

        } else {
            log(socket.id, room);
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room, socket.id);
            io.sockets.in(room).emit('ready');
        }
    });

    socket.on('ipaddr', function () {
        const ifaces = os.networkInterfaces();
        for (let dev in ifaces) {
            ifaces[dev].forEach(function (details) {
                if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    socket.emit('ipaddr', details.address);
                }
            });
        }
    });

    socket.on('bye', function () {
        console.log('received bye');
    });

});
