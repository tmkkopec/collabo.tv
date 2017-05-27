'use strict';

const React = require('react');
const PropTypes = require('prop-types');

class Tab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <a href={'#scroll-tab-' + this.props.id} className="mdl-layout__tab is-active">Room a</a>
    }
}

Tab.propTypes = {
    id: PropTypes.number.isRequired
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
                    {this.props.roomIDs.map((element) => <Tab id={element} key={'t' + element}/>)}
                </div>
            </header>
        )
    }
}

Header.propTypes = {
    onLogout: PropTypes.func,
    roomIDs: PropTypes.arrayOf(PropTypes.number).isRequired
};

export default Header;