'use strict';

const React = require('react');
const PropTypes = require('prop-types');
import Header from './Header';
import WebRTCConfig from "../WebRTCConfig";
import SectionsController from "./SectionsController";
import Drawer from './Drawer';
import $ from 'jquery';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roomIDs: [this.props.roomID]
        };
        this.webrtc = new WebRTCConfig(this.props.roomID);

        this.onLogout = this.onLogout.bind(this);
    }

    onLogout() {
        const self = this;
        $.ajax({
            async: false,
            type: "POST",
            url: '/logout',
            success: function (data) {
                self.webrtc.logout();
            }
        });
    }

    render() {
        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-tabs mdl-layout--fixed-header">
                <Header onLogout={this.onLogout} roomIDs={this.state.roomIDs}/>
                <Drawer/>
                <SectionsController sectionIDs={this.state.roomIDs} webrtc={this.webrtc}/>
            </div>
        )
    }

}

Home.propTypes = {
    roomID: PropTypes.string.isRequired
};

export default Home;