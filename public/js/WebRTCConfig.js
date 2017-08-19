'use strict';

import io from 'socket.io-client';

class WebRTCConfig {
    constructor(roomID) {
        const self = this;
        this._section = undefined;
        this.isChannelReady = false;
        this.isInitiator = false;
        this.isStarted = false;
        this.localStream = undefined;
        this.sender = undefined;
        this.pc = {};
        this.socket = io.connect();

        this.socket.on('created', function (room) {
            console.log('Created room ' + room);
            self.isInitiator = true;
        });

        this.socket.on('full', function (room) {
            console.log('Room ' + room + ' is full');
        });

        this.socket.on('join', function (room) {
            console.log('Another peer made a request to join room ' + room);
            self.isChannelReady = true;
        });

        this.socket.on('joined', function (room) {
            console.log('joined: ' + room);
            self.isChannelReady = true;
        });

        this.socket.on('log', function (array) {
            console.log.apply(console, array);
        });

        this.socket.on('message', function (message) {
            console.log('Client received message:', message);
            if (message === 'got user media') {
                self.maybeStart();
            } else if (message.type === 'offer') {
                console.log('received offer!', message);
                self.doAnswer(message);
            } else if (message.type === 'answer' && self.isStarted) {
                self.pc.setRemoteDescription(message)
                    .then(() => {
                        console.log("FINAL PC AFTER SET REMOTE", self.pc);
                    });
            } else if (message.type === 'candidate' && self.isStarted) {
                let candidate = new RTCIceCandidate({
                    sdpMLineIndex: message.label,
                    candidate: message.candidate
                });
                self.pc.addIceCandidate(candidate);
            } else {
                console.warn("UNRECOGNIZED MESSAGE RECEIVED", message, "isStarted", self.isStarted);
            }
        });

        const room = roomID;
        if (room !== '') {
            this.socket.emit('create or join', room);
        }

        window.onbeforeunload = function () {
            if (self.isStarted) {
                self.pc.removeTrack(self.sender);
            }
        };

        this.gotStream = this.gotStream.bind(this);
        this.setLocalAndSendMessage = this.setLocalAndSendMessage.bind(this);
        this.handleIceCandidate = this.handleIceCandidate.bind(this);
        this.handleRemoteStreamAdded = this.handleRemoteStreamAdded.bind(this);
        this.handleRemoteStreamRemoved = this.handleRemoteStreamRemoved.bind(this);
        this.handleNegotiation = this.handleNegotiation.bind(this);
    }

    set section(section) {
        this._section = section;
    }

    sendMessage(message) {
        console.log('Client sending message: ', message);
        this.socket.emit('message', message);
    }


    gotStream(stream) {
        this.createPeerConnection();
        this.localStream = stream;
        document.querySelector("#localVideo").srcObject = stream;
        this.sendMessage('got user media');
        if (this.isInitiator) {
            this.maybeStart();
        }
    }

    maybeStart() {
        console.log('>>>>>>> maybeStart() ', this.isStarted, this.sender, this.isChannelReady);
        console.log('LOCAL TRACKS', this.localStream.getTracks());
        if (!this.isStarted && this.isChannelReady) {
            console.log('>>>>>> creating peer connection');
            const self = this;
            this.localStream.getTracks().forEach(track => {
                console.log('ADDING TRACK', track);
                self.sender = self.pc.addTrack(track, self.localStream)
            });
            console.log('GET SENDERS', this.pc.getSenders(), 'GET RECEIVERS', this.pc.getReceivers());
            this.isStarted = true;
        }
    }

    createPeerConnection() {
        try {
            const configuration = {
                iceServers: [
                    {
                        urls: 'stun:stun.l.google.com:19302'
                    }]
            };
            this.pc = new RTCPeerConnection(configuration);
            this.pc.onicecandidate = this.handleIceCandidate;
            this.pc.ontrack = this.handleRemoteStreamAdded;
            this.pc.onremovestream = this.handleRemoteStreamRemoved;
            this.pc.onnegotiationneeded = this.handleNegotiation;
            console.log('Created RTCPeerConnection');
        } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object.');
        }
    }

    handleIceCandidate(event) {
        if (event.candidate) {
            this.sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            console.log('End of candidates.');
        }
    }

    handleRemoteStreamAdded(track) {
        const ids = this._section.state.remoteVideoIDs;
        let newId = track.streams[0].id;
        newId = newId.substring(1, newId.length - 1);

        this._section.setState({
            remoteVideoIDs: ids.concat([newId])
        }, () => {
            console.log('Adding remote stream for ' + newId, track);
            document.querySelector('#r' + newId).srcObject = track.streams[0];
        });
    }

    handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
        const ids = this._section.state.remoteVideoIDs;
        let toRemoveId = event.stream.id;
        toRemoveId = toRemoveId.substring(1, toRemoveId.length - 1);

        for (let i = 0; i < ids.length; i++)
            if (ids[i] === toRemoveId) {
                ids.splice(i, 1);
                break;
            }

        this._section.setState({
            remoteVideoIDs: ids
        });
    }

    handleCreateOfferError(event) {
        console.log('createOffer() error: ', event);
    }

    handleNegotiation() {
        console.log('Sending offer to peer');
        this.pc.createOffer(this.setLocalAndSendMessage, this.handleCreateOfferError);
    }

    doAnswer(message) {
        console.log('Sending answer to peer');
        this.pc.setRemoteDescription(message)
            .then(() => {
                console.log('PC', this.pc);
                this.pc.createAnswer()
                    .then((description) => {
                        this.maybeStart();
                        this.setLocalAndSendMessage(description);
                    })
                    .catch((error) => this.onCreateSessionDescriptionError(error));
            })
            .catch((error) => console.error(error));
    }

    setLocalAndSendMessage(sessionDescription) {
        this.pc.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message', sessionDescription);
        this.sendMessage(sessionDescription);
    }

    onCreateSessionDescriptionError(error) {
        console.error('Failed to create session description: ' + error.toString());
    }

    handleRemoteHangup() {
        console.log('Session terminated.');
        this.stop();
        // this.isInitiator = false;
    }

    logout() {
        if (this.isStarted) {
            this.pc.removeTrack(this.sender);
        }
    }

    stop() {
        this.isStarted = false;
        // isAudioMuted = false;
        // isVideoMuted = false;
        this.pc.close();
        this.pc = null;
    }
}

export default WebRTCConfig;