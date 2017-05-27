'use strict';

const React = require('react');
import Header from './Header';
import SectionsController from "./SectionsController";
import Drawer from './Drawer';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roomIDs: [1]
        }
    }

    onLogout() {
        console.log("TODO handle logout");
    }

    render() {
        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header">
                <Header onLogout={this.onLogout} roomIDs={this.state.roomIDs}/>
                <Drawer/>
                <SectionsController sectionIDs={this.state.roomIDs}/>
            </div>
        )
    }

}

export default Home;