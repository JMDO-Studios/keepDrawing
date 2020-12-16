import React, { Component } from 'react';

export default class ChatItem extends Component {
  render() {
    const { message } = this.props;
    // const isOwnMessage = message.author === participant;
    return (
      <div className="chat-item">
        <div className="author">{message.author}</div>
        <div className="message">{message.body}</div>
      </div>
    );
  }
}
