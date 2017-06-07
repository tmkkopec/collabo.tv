'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
import * as Cookies from 'js-cookie';
import Home from './components/Home';

const roomID = Cookies.get('roomID');

ReactDOM.render(
    <Home roomID={roomID}/>,
    document.getElementById('root')
);

