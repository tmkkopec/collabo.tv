'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
import Home from './components/Home';
import * as Cookies from "js-cookie";

const initialRoom = Cookies.get('initialRoom');

ReactDOM.render(
    <Home initialRoom={initialRoom}/>,
    document.getElementById('root')
);

