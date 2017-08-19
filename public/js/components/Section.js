'use strict';


const React = require('react');
const PropTypes = require('prop-types');
const uniqueId = require('lodash/uniqueId');
import Video from "./Video";
import MdlGrid from './MdlGrid';
import MdlCell from './MdlCell';

class Section extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socketID: undefined,
            remoteVideoIDs: [],
            prevRemoteVideoIDs: []
        };
    }

    componentDidMount() {
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: true
            })
            .then((stream) => {
                this.props.webrtc.section = this;
                this.props.webrtc.gotStream(stream);
            })
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
    id: PropTypes.string.isRequired,
    webrtc: PropTypes.object.isRequired
};

export default Section;