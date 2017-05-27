'use strict';

const React = require('react');

class Drawer extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="mdl-layout__drawer">
                <span className="mdl-layout-title">Collabo.tv</span>
            </div>
        )
    }
}

export default Drawer;