'use strict';

const React = require('react');
import PropTypes from 'prop-types';
import Header from './Header';
import SectionsController from "./SectionsController";
import Drawer from './Drawer';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roomIDs: [this.props.initialRoom]
        };
        this.addRoom = this.addRoom.bind(this);
    }

    onLogout() {
        console.log("TODO handle logout");
    }

    addRoom(roomName) {
        const self = this;
        this.setState({
            roomIDs: self.state.roomIDs.concat([roomName])
        });
    }

    render() {
        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header">
                <Header onLogout={this.onLogout}
                        roomIDs={this.state.roomIDs}/>
                <Drawer/>
                <SectionsController sectionIDs={this.state.roomIDs}
                        addRoom={this.addRoom}/>
            </div>
        )
    }

}

Home.propTypes = {
    initialRoom: PropTypes.string.isRequired
};

export default Home;