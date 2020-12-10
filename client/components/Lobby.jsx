import React, { Component } from 'react';
import Waitingroom from './Waitingroom';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: {},
    };
    this.save = this.save.bind(this);
  }

  save(ev) {
    const { socket } = this.props;
    ev.preventDefault();
    const { player } = this.state;
    socket.name = player.name;
    const { name } = socket;
    socket.emit('change name', name);
  }

  render() {
    const { name } = this.state;
    const { socket } = this.props;
    return (socket.name === '' ? (
      <div>
        <h1>Lobby Room</h1>
        <div className="lobby-div">
          {/* <form className="lobby-form" onSubmit={this.save}> */}
          <form className="lobby-form" onSubmit={this.save}>
            <label htmlFor="username" className="lobby-label">Username:</label>
            <input
              name="username"
              className="lobby-input"
              value={name}
              onChange={(ev) => this.setState({
                player: { name: ev.target.value },
              })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  this.save(e);
                }
              }}
            />
            <label> Press Enter</label>
          </form>
        </div>
      </div>
    ) : (<Waitingroom socket={socket} />));
  }
}

export default Lobby;
