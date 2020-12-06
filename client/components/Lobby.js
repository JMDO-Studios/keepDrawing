import React, { Component } from 'react';
//import { DeliveryReceiptPage } from 'twilio/lib/rest/conversations/v1/conversation/message/deliveryReceipt';
//import io from 'socket.io-client';
//const socket = io();

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
    window.localStorage.setItem('players', JSON.stringify(players));
  }

  componentDidMount() {
    console.log('cDu ', this.props);
  }

  componentDidUpdate() {
    console.log('state', this.state);
    //this is store on the browser
    console.log(window.localStorage.players);
  }

  render() {
    const { name } = this.state;
    const { socket } = this.props;
    return (
      <div>
        <h1>Lobby Room</h1>
        <div className="lobby-div">
          <form className="lobby-form" onSubmit={this.save}>
            <label className="lobby-label">Username:</label>
            <input
              className="lobby-input"
              value={name}
              onChange={(ev) =>
                this.setState({
                  player: { name: ev.target.value, id: socket.id },
                })
              }
            />
            <button className="lobby-button"> submit </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Lobby;

