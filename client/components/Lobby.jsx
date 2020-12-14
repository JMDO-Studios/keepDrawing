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
    ev.preventDefault();
    const { changeName, handleStatusChange, isVideo } = this.props;
    const { name } = this.state.player;
    if (name && isVideo) {
      changeName(name);
      handleStatusChange('waiting room', name);
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
                onChange={(ev) => {
                  this.setState({
                    player: { name: ev.target.value },
                  });
                }}
              />
            </label>
            <button type="submit" className="lobby-button"> submit </button>
            <p className ='lobby-status'>{message}</p>
          </form>
        </div>
      </div>
    );
  }
}

export default Lobby;
