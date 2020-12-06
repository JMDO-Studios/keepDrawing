import React, { Component } from 'react';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: {},
      players: [],
    };
    this.save = this.save.bind(this);
  }

  save(ev) {
    ev.preventDefault();
    const { player, players } = this.state;
    this.setState({ players: [...players, player] });
  }

  render() {
    const { name } = this.state;
    const { socket } = this.props;
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
                  player: { name: ev.target.value, id: socket.id },
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
