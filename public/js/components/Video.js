'use strict';

import React from 'react';
import MdlCell from './MdlCell';
import PropTypes from 'prop-types';

class Video extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <MdlCell cellWidth={this.props.cellWidth}>
                <video id={this.props.isRemoteVideo ? 'r' + this.props.videoId : this.props.videoId} autoPlay/>
            </MdlCell>
        )
    }
}

Video.propTypes = {
    cellWidth: PropTypes.number.isRequired,
    videoId: PropTypes.string.isRequired,
    isRemoteVideo: PropTypes.bool
};

export default Video;