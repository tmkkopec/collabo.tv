'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const uniqueId = require('lodash/uniqueId');

class Tab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <a href={'#scroll-tab-' + this.props.id} className="mdl-layout__tab">
            Room {this.props.id}
        </a>
    }
}

Tab.propTypes = {
    id: PropTypes.string.isRequired
};

class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    // force upgrading dynamic elements for mdl framework. TODO find better solution
    componentDidUpdate() {
        const layout = document.querySelector('.mdl-js-layout');
        window.setTimeout(function () {
            const tabs = document.querySelectorAll('.mdl-layout__tab');
            const panels = document.querySelectorAll('.mdl-layout__tab-panel');
            for (let i = 0; i < tabs.length; i++) {
                new MaterialLayoutTab(tabs[i], tabs, panels, layout.MaterialLayout);
            }
        }, 500);
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
                    {this.props.roomIDs.map((roomID) => <Tab id={roomID} key={uniqueId()}/>)}
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