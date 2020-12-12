import React, { Component } from 'react';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: {},
    };
    this.save = this.save.bind(this);
  }

  save(ev) {
    const { socket, handleStatusChange, isVideo } = this.props;
    const { player } = this.state;
    ev.preventDefault();
    if (player.name && isVideo) {
      socket.name = player.name;
      handleStatusChange('waiting room');
    }
  }

  render() {
    const { name } = this.state;
    const { message } = this.props;
    return (
      <div>
        <h1>Lobby Room</h1>
        <div className="lobby-div">
          <form className="lobby-form" onSubmit={this.save}>
            <label htmlFor="username" className="lobby-label">Username:
              <input
                name="username"
                className="lobby-input"
                value={name}
                onChange={(ev) => this.setState({
                  player: { name: ev.target.value },
                })}
              />
            </label>
            <button type="submit" className="lobby-button"> submit </button>
            <label>{message}</label>
          </form>
        </div>
      </div>
    );
  }
}

export default Lobby;
