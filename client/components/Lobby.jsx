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
    const { socket } = this.props;
    ev.preventDefault();
    const { player } = this.state;
    socket.name = player.name;
    this.props.history.push('/waitingroom');
  }

  render() {
    const { name } = this.state;

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
          </form>
        </div>
      </div>
    );
  }
}

export default Lobby;
