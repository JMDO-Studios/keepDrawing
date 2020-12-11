import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import Lobby from './components/Lobby';

const socket = io();
socket.name = '';
socket.game = '';

ReactDOM.render(<Lobby socket={socket} />, document.getElementById('root'));
