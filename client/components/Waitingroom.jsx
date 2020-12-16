import React, { Component } from 'react';

const { bombGameSettings } = require('../../gameSettings');

class Waitingroom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      messages: [`Welcome, ${this.props.socket.name}!`],
    };
  }

  componentDidMount() {
    const { socket, handleStatusChange } = this.props;
    socket.emit('change name', { name: socket.name });
    socket.on('goToGame', () => {
      handleStatusChange('game');
    });
    socket.on('helloWorld', () => {
      console.log('Hello world');
    });
  }

  componentWillUnmount() {
    const { socket } = this.props;
    socket.emit('leftWaitingRoom');
  }

  render() {
    const { playersNeeded } = this.state;
    return (
      <div>
        <h1>Waiting Room</h1>
        <h2>Players in Waiting Room:</h2>
        <h2>{playersNeeded} more players needed to start</h2>
      </div>
    );
  }
}

export default Waitingroom;
