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
    const { socket, handleStatusChange } = this.props;
    ev.preventDefault();
    if (this.state.player.name && this.props.isVideo) {
      const { player } = this.state;
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
