'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const uniqueId = require('lodash/uniqueId');
import Section from './Section';

class SectionsController extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <main className="mdl-layout__content">
                {this.props.sectionIDs.map((element) => <Section webrtc={this.props.webrtc}
                                                                 id={element}
                                                                 key={uniqueId()}/>)}
            </main>
        )
    }
}

SectionsController.propTypes = {
    sectionIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
    webrtc: PropTypes.object.isRequired
};

export default SectionsController;