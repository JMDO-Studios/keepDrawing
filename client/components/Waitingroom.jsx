import React, { Component } from 'react';

class Waitingroom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      messages: [`welcome ${this.props.socket.name}`],
    };
    this.editMessage = this.editMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  componentDidMount() {
    const { socket, handleStatusChange } = this.props;
    socket.emit('change name', { name: socket.name });
    socket.on('goToGame', () => {
      handleStatusChange('game');
    });
    socket.on('chat message', (msg) => {
      this.setState({
        message: msg,
        messages: [...this.state.messages, msg],
      });
    });
  }

  editMessage(e) {
    e.preventDefault();
    this.setState({ message: e.target.value });
  }

  sendMessage(e) {
    e.preventDefault();
    const { message } = this.state;
    const { socket } = this.props;
    if (message) {
      socket.emit('chat message', message);
    }
    this.setState({ message: '' });
  }

  render() {
    const { message, messages } = this.state;
    const { editMessage, sendMessage } = this;

    return (
      <div>
        <h1>Waiting Room</h1>
        <div id="wait">
          <ul id="messages">
            {messages.map((m, i) => <li key={i}>{m}</li>)}
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
          <div>Press Enter</div>
        </div>
      </div>
    );
  }
}

export default Waitingroom;
