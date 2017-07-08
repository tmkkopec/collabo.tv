'use strict';


const React = require('react');
const PropTypes = require('prop-types');
const uniqueId = require('lodash/uniqueId');
import io from 'socket.io-client';
import Video from "./Video";
import MdlGrid from './MdlGrid';
import MdlCell from './MdlCell';

class Section extends React.Component {
    constructor(props) {
        super(props);
        const self = this;
        this.state = {
            socketID: undefined,
            remoteVideoIDs: [],
            prevRemoteVideoIDs: []
        };

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
            self.setState({
                socketID: array[1]
            })
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

        const room = this.props.id;
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
        if (!this.isStarted && this.isChannelReady) {
            console.log('>>>>>> creating peer connection');
            const self = this;
            this.localStream.getTracks().forEach(track => {
                console.log('ADDING TRACK', track);
                self.sender = self.pc.addTrack(track, self.localStream)
            });
            this.isStarted = true;
        }
    }

    createPeerConnection() {
        try {
            this.pc = new RTCPeerConnection(null);
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
        const ids = this.state.remoteVideoIDs;
        let newId = track.streams[0].id;
        newId = newId.substring(1, newId.length - 1);

        this.setState({
            remoteVideoIDs: ids.concat([newId])
        }, () => {
            console.log('Adding remote stream for ' + newId, track);
            document.querySelector('#r' + newId).srcObject = track.streams[0];
        });
    }

    handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
        const ids = this.state.remoteVideoIDs;
        let toRemoveId = event.stream.id;
        toRemoveId = toRemoveId.substring(1, toRemoveId.length - 1);

        for (let i = 0; i < ids.length; i++)
            if (ids[i] === toRemoveId) {
                ids.splice(i, 1);
                break;
            }

        this.setState({
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
                console.log('pc', this.pc)
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
                audio: false,
                video: true
            })
            .then(this.gotStream)
            .catch(function (e) {
                alert('getUserMedia() error: ' + e.toString());
            });
    }

    render() {
        return (
            <section className="mdl-layout__tab-panel is-active" id={'scroll-tab-' + this.props.id}>
                <div className="page-content">
                    <MdlGrid>
                        <MdlCell cellWidth={6}>
                            <div className="broadcast">
                                <MdlGrid>
                                    <Video cellWidth={12 / (this.state.remoteVideoIDs.length + 1)}
                                           videoId="localVideo"/>
                                    {this.state.remoteVideoIDs.map((videoId) =>
                                        <Video cellWidth={12 / (this.state.remoteVideoIDs.length + 1)}
                                               videoId={videoId}
                                               isRemoteVideo={true}
                                               key={uniqueId()}/>)}
                                </MdlGrid>
                            </div>
                        </MdlCell>
                        <MdlCell cellWidth={6}>
                            <div id="video">
                                <iframe src="https://www.youtube.com/embed/Qmn2bhY07NQ"/>
                            </div>
                        </MdlCell>
                    </MdlGrid>
                </div>
            </section>
        )
    }
}

Section.propTypes = {
    id: PropTypes.string.isRequired
};

export default Section;