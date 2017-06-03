'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const uniqueId = require('lodash/uniqueId');
import MdlGrid from './MdlGrid';
import MdlCell from './MdlCell';
import AddDialog from './AddDialog';
import global from '../videoStreams';

class Section extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            remoteVideoIDs: []
        }
    }

    static createRemoteView() {
        const ids = this.state.remoteVideoIDs;
        const lastID = ids[ids.length];
        this.setState({
            remoteVideoIDs: ids.push(lastID + 1)
        }, () => {
            global.getNewView(document.querySelector('#remote' + (lastID + 1)))
        });
    }

    render() {
        return (
            <section className="mdl-layout__tab-panel" id={'scroll-tab-' + this.props.id}>
                <MdlGrid>
                    <MdlCell cellWidth={12}>
                        <div className="page-content">
                            <div id="video">
                                <iframe src=""/>
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

global.createRemoteView = Section.createRemoteView;
global.getLocalView = () => {
    return document.querySelector('#localVideo');
};

class SectionsController extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <main className="mdl-layout__content">
                {this.props.sectionIDs.map((element) => <Section id={element} key={uniqueId()}/>)}
                <AddDialog addRoom={this.props.addRoom}/>
            </main>
        )
    }
}

SectionsController.propTypes = {
    addRoom: PropTypes.func.isRequired,
    sectionIDs: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default SectionsController;