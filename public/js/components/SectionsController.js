'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const uniqueId = require('lodash/uniqueId');
import io from 'socket.io-client';
import MdlGrid from './MdlGrid';
import MdlCell from './MdlCell';

class Section extends React.Component {
    constructor(props) {
        super(props);
        const self = this;
        this.state = {
            remoteVideoIDs: []
        };

        this.isChannelReady = false;
        this.isInitiator = false;
        this.isStarted = false;
        this.localStream = {};
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
            console.log('This peer is the initiator of room ' + room + '!');
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
                if (!self.isInitiator && !self.isStarted) {
                    self.maybeStart();
                }
                self.pc.setRemoteDescription(new RTCSessionDescription(message));
                self.doAnswer();
            } else if (message.type === 'answer' && self.isStarted) {
                self.pc.setRemoteDescription(new RTCSessionDescription(message));
            } else if (message.type === 'candidate' && self.isStarted) {
                let candidate = new RTCIceCandidate({
                    sdpMLineIndex: message.label,
                    candidate: message.candidate
                });
                self.pc.addIceCandidate(candidate);
            } else if (message === 'bye' && self.isStarted) {
                self.handleRemoteHangup();
            }
        });

        const room = this.props.id;
        if (room !== '') {
            this.socket.emit('create or join', room);
        }

        window.onbeforeunload = function () {
            self.sendMessage('bye');
        };

        this.gotStream = this.gotStream.bind(this);
        this.setLocalAndSendMessage = this.setLocalAndSendMessage.bind(this);
        this.handleIceCandidate = this.handleIceCandidate.bind(this);
        this.handleRemoteStreamAdded = this.handleRemoteStreamAdded.bind(this);
    }

    sendMessage(message) {
        console.log('Client sending message: ', message);
        this.socket.emit('message', message);
    }


    gotStream(stream) {
        document.querySelector('#localVideo').srcObject = stream;
        this.localStream = stream;
        this.sendMessage('got user media');
        if (this.isInitiator) {
            this.maybeStart();
        }
    }

    maybeStart() {
        console.log('>>>>>>> maybeStart() ', this.isStarted, this.localStream, this.isChannelReady);
        if (!this.isStarted && typeof this.localStream !== 'undefined' && this.isChannelReady) {
            console.log('>>>>>> creating peer connection');
            this.createPeerConnection();
            this.pc.addStream(this.localStream);
            this.isStarted = true;
            console.log('isInitiator', this.isInitiator);
            if (this.isInitiator) {
                this.doCall();
            }
        }
    }

    createPeerConnection() {
        try {
            this.pc = new RTCPeerConnection(null);
            this.pc.onicecandidate = this.handleIceCandidate;
            this.pc.onaddstream = this.handleRemoteStreamAdded;
            this.pc.onremovestream = this.handleRemoteStreamRemoved;
            console.log('Created RTCPeerConnection');
        } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object.');
        }
    }

    handleIceCandidate(event) {
        console.log('icecandidate event: ', event);
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

    handleRemoteStreamAdded(event) {
        const ids = this.state.remoteVideoIDs;
        let lastID;

        if (ids.length !== 0)
            lastID = ids[ids.length - 1];
        else
            lastID = 0;

        this.setState({
            remoteVideoIDs: ids.concat([lastID + 1])
        }, () => {
            const id = '#remote' + (lastID + 1);
            console.log('Adding remote stream for '  + id);
            document.querySelector(id).srcObject = event.stream;
        });
    }

    handleCreateOfferError(event) {
        console.log('createOffer() error: ', event);
    }

    doCall() {
        console.log('Sending offer to peer');
        this.pc.createOffer(this.setLocalAndSendMessage, this.handleCreateOfferError);
    }

    doAnswer() {
        console.log('Sending answer to peer.');
        this.pc.createAnswer().then(
            this.setLocalAndSendMessage,
            this.onCreateSessionDescriptionError
        );
    }

    setLocalAndSendMessage(sessionDescription) {
        // Set Opus as the preferred codec in SDP if Opus is present.
        //  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
        this.pc.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message', sessionDescription);
        this.sendMessage(sessionDescription);
    }

    onCreateSessionDescriptionError(error) {
        trace('Failed to create session description: ' + error.toString());
    }

    handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
    }

    handleRemoteHangup() {
        console.log('Session terminated.');
        this.stop();
        this.isInitiator = false;
    }

    stop() {
        this.isStarted = false;
        // isAudioMuted = false;
        // isVideoMuted = false;
        this.pc.close();
        this.pc = null;
    }

    componentDidMount() {
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: true
            })
            .then(this.gotStream)
            .catch(function (e) {
                alert('getUserMedia() error: ' + e);
            });
    }

    render() {
        return (
            <section className="mdl-layout__tab-panel is-active" id={'scroll-tab-' + this.props.id}>
                <MdlGrid>
                    <MdlCell cellWidth={12}>
                        <div className="page-content">
                            <div id="video">
                                <iframe src="https://www.youtube.com/embed/drPx0OPav8o"/>
                            </div>
                            <div className="broadcast">
                                <MdlGrid>
                                    <MdlCell cellWidth={12 / (this.state.remoteVideoIDs.length + 1)}>
                                        <video id="localVideo" autoPlay/>
                                    </MdlCell>
                                    {this.state.remoteVideoIDs.map((videoID) =>
                                        <MdlCell cellWidth={12 / (this.state.remoteVideoIDs.length + 1)}>
                                            <video id={'remote' + videoID} key={uniqueId()} autoPlay/>
                                        </MdlCell>)}
                                </MdlGrid>
                            </div>
                        </div>
                    </MdlCell>
                </MdlGrid>
            </section>
        )
    }
}

Section.propTypes = {
    id: PropTypes.string.isRequired
};

class SectionsController extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <main className="mdl-layout__content">
                {this.props.sectionIDs.map((element) => <Section id={element} key={uniqueId()}/>)}
            </main>
        )
    }
}

SectionsController.propTypes = {
    sectionIDs: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default SectionsController;