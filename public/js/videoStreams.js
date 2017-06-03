'use strict';

let isChannelReady = false,
    isInitiator = false,
    isStarted = false,
    localStream,
    pc,
    remoteStream,
    eventHolder = {};

let url = window.location.href;
let splitted_url = url.split("/");
let room = splitted_url[splitted_url.length - 1];

let socket = io.connect();

if (room !== '') {
    socket.emit('create or join', room);
}

socket.on('created', function (room) {
    console.log('Created room ' + room);
    isInitiator = true;
});

socket.on('full', function (room) {
    console.log('Room ' + room + ' is full');
});

socket.on('join', function (room) {
    console.log('Another peer made a request to join room ' + room);
    console.log('This peer is the initiator of room ' + room + '!');
    isChannelReady = true;
});

socket.on('joined', function (room) {
    console.log('joined: ' + room);
    isChannelReady = true;
});

socket.on('log', function (array) {
    console.log.apply(console, array);
});

socket.on('message', function (message) {
    console.log('Client received message:', message);
    if (message === 'got user media') {
        maybeStart();
    } else if (message.type === 'offer') {
        if (!isInitiator && !isStarted) {
            maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
    } else if (message.type === 'answer' && isStarted) {
        pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate' && isStarted) {
        let candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
        });
        pc.addIceCandidate(candidate);
    } else if (message === 'bye' && isStarted) {
        handleRemoteHangup();
    }
});

function gotStream(stream) {
    let localVideo = global.getLocalView();
    localVideo.srcObject = stream;
    localStream = stream;
    sendMessage('got user media');
    if (isInitiator) {
        maybeStart();
    }
}

function sendMessage(message) {
    console.log('Client sending message: ', message);
    socket.emit('message', message);
}

function maybeStart() {
    console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
    if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
        console.log('>>>>>> creating peer connection');
        createPeerConnection();
        pc.addStream(localStream);
        isStarted = true;
        console.log('isInitiator', isInitiator);
        if (isInitiator) {
            doCall();
        }
    }
}

function createPeerConnection() {
    try {
        pc = new RTCPeerConnection(null);
        pc.onicecandidate = handleIceCandidate;
        pc.onaddstream = handleRemoteStreamAdded;
        pc.onremovestream = handleRemoteStreamRemoved;
        console.log('Created RTCPeerConnection');
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
    }
}

function handleIceCandidate(event) {
    console.log('icecandidate event: ', event);
    if (event.candidate) {
        sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        });
    } else {
        console.log('End of candidates.');
    }
}

function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    eventHolder = event;
    global.createRemoteView();
}

function callbackRemoteStreamAdded(div) {
    div.srcObject = eventHolder.stream;
    remoteStream = eventHolder.stream;
}

function handleCreateOfferError(event) {
    console.log('createOffer() error: ', event);
}

function doCall() {
    console.log('Sending offer to peer');
    pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
    console.log('Sending answer to peer.');
    pc.createAnswer().then(
        setLocalAndSendMessage,
        onCreateSessionDescriptionError
    );
}

function setLocalAndSendMessage(sessionDescription) {
    // Set Opus as the preferred codec in SDP if Opus is present.
    //  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
    pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndSendMessage sending message', sessionDescription);
    sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
    trace('Failed to create session description: ' + error.toString());
}

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}

function handleRemoteHangup() {
    console.log('Session terminated.');
    stop();
    isInitiator = false;
}

function stop() {
    isStarted = false;
    // isAudioMuted = false;
    // isVideoMuted = false;
    pc.close();
    pc = null;
}


const global = {};
global.getNewView = (div) => {
    callbackRemoteStreamAdded(div);
};

navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: true
    })
    .then(gotStream)
    .catch(function (e) {
        alert('getUserMedia() error: ' + e.name);
    });

window.onbeforeunload = function () {
    sendMessage('bye');
};

export default global;