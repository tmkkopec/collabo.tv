'use strict';

const React = require('react');
const PropTypes = require('prop-types');

class MdlCell extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={'mdl-cell mdl-cell--' + this.props.cellWidth + '-col'}>
                {this.props.children}
            </div>
        )
    }
}

MdlCell.propTypes = {
    cellWidth: PropTypes.number.isRequired
};

module.exports = MdlCell;