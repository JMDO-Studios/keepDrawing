import React, { Component } from 'react';
import { render } from 'react-dom';
//import io from 'socket.io-client';
//const socket = io();


class Waitingroom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      messages: ['welcome'],
    };
    this.editMessage = this.editMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  editMessage(e) {
    e.preventDefault();
    this.setState({ message: e.target.value });
  }

  sendMessage(e) {
    e.preventDefault();
    let { message } = this.state;
    if (message) {
      this.props.socket.emit('chat message', message);
    }
    this.setState({ message: '' });
    //this.post()
  }


  componentDidMount() {
    console.log('cDm ', this.props)
    this.props.socket.on('chat message', (msg) => {
      this.setState({
        message: msg,
        messages: [...this.state.messages, msg],
      });
    });
  }

  render() {
    console.log(this.state);
    const { message, messages } = this.state;
    let { editMessage, sendMessage } = this;

    return (
      <div id="wait">
        <ul id="messages">
          {messages.map((m, i) => {
            return <li key={i}>{m}</li>;
          })}
        </ul>
        <form id="form">
          <input
            className="wait-input"
            id="m"
            value={message}
            onChange={editMessage}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(e);
              }
            }}
          />
        </form>
        <label>Press Enter</label>
      </div>
    );
  }
}

export default Waitingroom;

