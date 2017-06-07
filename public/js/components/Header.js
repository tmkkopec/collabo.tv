'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const uniqueId = require('lodash/uniqueId');

class Tab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <a href={'#scroll-tab-' + this.props.id} className="mdl-layout__tab is-active">Room {this.props.id}</a>
    }
}

Tab.propTypes = {
    id: PropTypes.string.isRequired
};

class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <header className="mdl-layout__header">
                <div className="mdl-layout__header-row">
                    <span className="mdl-layout-title">Collabo.tv</span>
                    <div className="mdl-layout-spacer"/>
                    <nav className="mdl-navigation">
                        <a className="mdl-navigation__link mdl-typography--button" href=""
                           onClick={this.props.onLogout}>Logout</a>
                    </nav>
                </div>
                <div className="mdl-layout__tab-bar mdl-js-ripple-effect">
                    {this.props.roomIDs.map((element) => <Tab id={element} key={uniqueId()}/>)}
                </div>
            </header>
        )
    }
}

Header.propTypes = {
    onLogout: PropTypes.func,
    roomIDs: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default Header;